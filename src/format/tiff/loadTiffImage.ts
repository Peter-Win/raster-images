import { PixelDepth } from "../../types";
import { ImageInfo, getImageLineSize } from "../../ImageInfo";
import { Converter, readImage } from "../../Converter";
import { RAStream, streamLock } from "../../stream";
import { TiffTag } from "./TiffTag";
import { Ifd } from "./ifd/Ifd";
import { getIfdNumbers } from "./ifd/IfdEntry";
import { ErrorRI } from "../../utils";
import { createStripsReader } from "./createStripsReader";
import { joinPlanes } from "../../Converter/rowOps/planes/joinPlanes";
import {
  TiffSampleFormat,
  tiffSampleFormatName,
} from "./tags/TiffSampleFormat";

interface Params {
  ifd: Ifd;
  stream: RAStream;
  info: ImageInfo;
  converter: Converter;
}

export const loadTiffImage = (params: Params) =>
  streamLock(params.stream, async () => {
    const { ifd, stream, info, converter } = params;

    const stripOffsets = await ifd.getNumbers(TiffTag.StripOffsets, stream);
    // const stripByteCounts = await ifd.getNumbers(TiffTag.StripByteCounts, stream);
    const eStripByteCounts = ifd.entries[TiffTag.StripByteCounts];
    let stripByteCounts: number[];
    if (eStripByteCounts) {
      stripByteCounts = await getIfdNumbers(
        eStripByteCounts,
        stream,
        ifd.littleEndian
      );
    } else if (stripOffsets.length === 1) {
      // По стандарту этот тег обязательный.
      // Однако есть ряд файлов, где его нет. А стандартные программы их успешно читают.
      // see G3PROB.TIF
      // Не удалось найти внятных рекомендаций, как действовать в таком случае.
      // Можно было бы искать конец данных, путем поиска следующего тега. Но результат не гарантирован.
      // Проще всего считать, что данные идут до конца файла.
      // Всё равно распаковщик дойдет до конца реальных данных и остановится
      const fileSize = await stream.getSize();
      stripByteCounts = [fileSize - stripOffsets[0]!];
    } else {
      throw new Error("Not found StripByteCounts tag");
    }

    const planarConfiguration = await ifd.getSingleNumber<number>(
      TiffTag.PlanarConfiguration,
      stream,
      1
    );

    if (stripByteCounts.length !== stripOffsets.length) {
      throw new ErrorRI(
        "Not equal StripOffsets=<nOfs> and StripByteCounts=<nCnt>",
        {
          nOfs: stripOffsets.length,
          nCnt: stripByteCounts.length,
        }
      );
    }

    const { x: width } = info.size;
    const nbpsv = info.vars?.bitsPerSample;
    const nativeBitsPerSamples: number[] | undefined = Array.isArray(nbpsv)
      ? nbpsv.map((n) => +n)
      : undefined;
    const bitsPerSample = info.fmt.maxSampleDepth as PixelDepth;
    const samplesCount = info.fmt.samples.length;
    const sampleFormats = await ifd.getNumbersOpt(TiffTag.SampleFormat, stream);
    const float16 = !!info.vars?.float16;
    type OnRow = (dstRow: Uint8Array, y: number) => Promise<void>;
    let onRow: OnRow;
    if (planarConfiguration === 2 && samplesCount > 1) {
      const bytesPerSample = bitsPerSample >> 3;
      // TODO: StripByteCounts count = SamplesPerPixel * StripsPerImage for PlanarConfiguration equal to 2
      const nPlanes = stripOffsets.length;
      if (nPlanes !== samplesCount)
        throw new ErrorRI(
          "Planar format requires that the count of strips=<st> be equal to the number of samples=<sm>",
          {
            st: nPlanes,
            sm: samplesCount,
          }
        );
      const planeReaders: OnRow[] = [];
      const planeRows: Uint8Array[] = [];
      for (let i = 0; i < nPlanes; i++) {
        planeRows[i] = new Uint8Array(width * bytesPerSample);
        const curBps = nativeBitsPerSamples?.[i];
        planeReaders[i] = await createStripsReader({
          offsets: [stripOffsets[i]!],
          sizes: [stripByteCounts[i]!],
          ifd,
          stream,
          bitsPerSample,
          samplesCount: 1,
          rowSize: width * bytesPerSample,
          nativeBitsPerSamples: curBps ? [curBps] : undefined,
          float16,
        });
      }
      onRow = async (dstRow: Uint8Array, y: number) => {
        for (let i = 0; i < nPlanes; i++) {
          await planeReaders[i]!(planeRows[i]!, y);
        }
        joinPlanes(width, bytesPerSample, planeRows, dstRow);
      };
    } else {
      if (sampleFormats) {
        const fmtName = (n: number | TiffSampleFormat) =>
          tiffSampleFormatName[n as TiffSampleFormat] || String(n);
        // Форматы всех компонент должны быть одинаковые
        const types = new Set(sampleFormats);
        if (types.size !== 1)
          throw new ErrorRI(
            "Different sample formats [<f>] are not supported",
            {
              f: Array.from(types).map(fmtName).join(", "),
            }
          );
      }
      onRow = await createStripsReader({
        offsets: stripOffsets,
        sizes: stripByteCounts,
        ifd,
        stream,
        bitsPerSample,
        samplesCount,
        rowSize: getImageLineSize(info),
        nativeBitsPerSamples,
        float16,
      });
    }
    await readImage(converter, info, onRow);
  });
