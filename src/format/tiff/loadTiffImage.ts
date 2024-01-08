import { PixelDepth } from "../../types";
import { ImageInfo, getImageLineSize } from "../../ImageInfo";
import { Converter, readImage } from "../../Converter";
import { RAStream, streamLock } from "../../stream";
import { TiffTag } from "./TiffTag";
import { Ifd } from "./ifd/Ifd";
import { getIfdNumbers } from "./ifd/IfdEntry";
import { ErrorRI } from "../../utils";
import { createStripsReader } from "./createStripsReader";

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
    const bitsPerSample = info.fmt.maxSampleDepth as PixelDepth;
    const samplesCount = info.fmt.samples.length;
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
        planeReaders[i] = await createStripsReader({
          offsets: [stripOffsets[i]!],
          sizes: [stripByteCounts[i]!],
          ifd,
          stream,
          bitsPerSample,
          samplesCount,
          rowSize: width * bytesPerSample,
        });
      }
      onRow = async (dstRow: Uint8Array, y: number) => {
        for (let i = 0; i < nPlanes; i++) {
          await planeReaders[i]!(planeRows[i]!, y);
        }
        let dstPos = 0;
        let srcPos = 0;
        for (let x = 0; x < width; x++) {
          for (let pi = 0; pi < nPlanes; pi++) {
            for (let bi = 0; bi < bytesPerSample; bi++) {
              // eslint-disable-next-line no-param-reassign
              dstRow[dstPos++] = planeRows[pi]![srcPos + bi]!;
            }
          }
          srcPos += bytesPerSample;
        }
      };
    } else {
      onRow = await createStripsReader({
        offsets: stripOffsets,
        sizes: stripByteCounts,
        ifd,
        stream,
        bitsPerSample,
        samplesCount,
        rowSize: getImageLineSize(info),
      });
    }
    await readImage(converter, info, onRow);
  });

// interface ParamsTransfer {
//   info: ImageInfo;
//   ifd: Ifd;
//   stream: RAStream;
// }
// type FnTransfer = (src: Uint8Array, srcPos: number, dst: Uint8Array) => number;

// const getTransfer = async ({
//   info,
//   ifd,
//   stream,
// }: ParamsTransfer): Promise<FnTransfer> => {
//   const { littleEndian } = ifd;
//   const sampleFormat = await ifd.getSingleNumber<TiffSampleFormat>(TiffTag.SampleFormat, stream, TiffSampleFormat.unsignedInteger)
//   const sampleFormatName = () =>
//     tiffSampleFormatName[sampleFormat] ?? String(sampleFormat);

//   const rowSize = getImageLineSize(info);
//   const { maxSampleDepth } = info.fmt;
//   if (maxSampleDepth === 64) {
//     if (sampleFormat !== TiffSampleFormat.floatingPoint) {
//       throw new ErrorRI("Unsupported sample format <f> for <bps> bit/sample", {
//         f: sampleFormatName(),
//         bps: maxSampleDepth,
//       });
//     }
//     return (src, srcPos, dst) => {
//       const fdst = new Float64Array(dst.buffer, dst.byteOffset);
//       const srcDv = new DataView(src.buffer, src.byteOffset + srcPos);
//       const count = rowSize / 8;
//       for (let i = 0; i < count; i++) {
//         fdst[i] = srcDv.getFloat64(8 * i, littleEndian);
//       }
//       return srcPos + rowSize;
//     };
//   }

//   return (src, srcPos, dst) => {
//     copyBytes(rowSize, src, srcPos, dst, 0);
//     return srcPos + rowSize;
//   };
// };
