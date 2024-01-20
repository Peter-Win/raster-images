import { PixelDepth } from "../../../types";
import { RAStream } from "../../../stream";
import { Converter, readImage } from "../../../Converter";
import { ImageInfo, getImageLineSize } from "../../../ImageInfo";
import { ErrorRI } from "../../../utils";
import { joinPlanes } from "../../../Converter/rowOps/planes/joinPlanes";
import { Ifd } from "../ifd/Ifd";
import { createStripsReader } from "./createStripsReader";
import { TiffTag } from "../TiffTag";
import {
  TiffSampleFormat,
  tiffSampleFormatName,
} from "../tags/TiffSampleFormat";
import { getFloatBitPerSample } from "./floatBitPerSample";
import {
  getNativeBitsPerSamples,
  getPlanarNativeBitsPerSamples,
} from "../compression/expandBitSamples";

interface Params {
  ifd: Ifd;
  stream: RAStream;
  info: ImageInfo;
  converter: Converter;
  stripOffsets: number[];
  stripByteCounts: number[];
  planarConfiguration: number;
}

export const loadStripImage = async (params: Params) => {
  const {
    ifd,
    stream,
    info,
    converter,
    stripOffsets,
    stripByteCounts,
    planarConfiguration,
  } = params;

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
  const nativeBitsPerSamples = getNativeBitsPerSamples(info.vars);
  const bitsPerSample = info.fmt.maxSampleDepth as PixelDepth;
  const samplesCount = info.fmt.samples.length;
  const sampleFormats = await ifd.getNumbersOpt(TiffTag.SampleFormat, stream);
  const floatBitsPerSample = getFloatBitPerSample(info.vars);
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
        samplesCount: 1,
        rowSize: width * bytesPerSample,
        nativeBitsPerSamples: getPlanarNativeBitsPerSamples(
          nativeBitsPerSamples,
          i
        ),
        floatBitsPerSample,
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
        throw new ErrorRI("Different sample formats [<f>] are not supported", {
          f: Array.from(types).map(fmtName).join(", "),
        });
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
      floatBitsPerSample,
    });
  }
  await readImage(converter, info, onRow);
};
