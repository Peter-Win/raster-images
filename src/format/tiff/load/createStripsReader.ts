import { RAStream } from "../../../stream";
import { TiffTag } from "../TiffTag";
import { createTiffDecompressor } from "../compression/createTiffDecompressor";
import { Ifd } from "../ifd/Ifd";
import { FnRowHandler, FnStripHandler, stripsReader } from "./stripsReader";
import { TiffCompression } from "../tags/TiffCompression";
import {
  TiffPredictor,
  createTiffPredictor,
} from "../compression/TiffPredictor";
import {
  FnNumberConversion,
  decodeDwords,
  decodeQwords,
  decodeWords,
} from "../../../Converter/rowOps/numbers";
import { PixelDepth } from "../../../types";
import { PhotometricInterpretation } from "../tags/PhotometricInterpretation";
import { ErrorRI } from "../../../utils";
import { expandBitSamples } from "../compression/expandBitSamples";
import { copyFloat16to32 } from "../../../math/float16";
import { copyFloat24to32 } from "../../../math/float24";
import { copyBytes } from "../../../Converter/rowOps/copy/copyBytes";

type ParamsCreateStripsReader = {
  offsets: number[];
  sizes: number[];
  ifd: Ifd;
  stream: RAStream;
  rowSize: number;
  bitsPerSample: PixelDepth;
  samplesCount: number;
  nativeBitsPerSamples?: number[]; // if used non-standard integer values, f.e: [10,10,10]
  floatBitsPerSample: number | undefined; // 16 or 24
};

export const createStripsReader = async (params: ParamsCreateStripsReader) => {
  const {
    offsets,
    sizes,
    ifd,
    stream,
    rowSize,
    bitsPerSample,
    samplesCount,
    nativeBitsPerSamples,
    floatBitsPerSample,
  } = params;
  const { littleEndian } = ifd;
  let needNumFmtCvt = bitsPerSample > 8;
  const stripHandlers: FnStripHandler[] = [];
  const rowHandlers: FnRowHandler[] = [];
  const photoInt: PhotometricInterpretation = await ifd.getSingleNumber(
    TiffTag.PhotometricInterpretation,
    stream
  );
  const stripRowSize = floatBitsPerSample
    ? (rowSize / 4) * (floatBitsPerSample / 8)
    : rowSize;
  // Compression
  let rowsPerStrip = await ifd.getSingleNumber(TiffTag.RowsPerStrip, stream, 0);
  if (!rowsPerStrip) {
    if (sizes.length === 1) {
      // example with this case: xing_t24.tif
      rowsPerStrip = await ifd.getSingleNumber(TiffTag.ImageLength, stream);
    } else {
      throw new ErrorRI("Expected tag RowsPerStrip");
    }
  }
  const compressionId = await ifd.getSingleNumber(
    TiffTag.Compression,
    stream,
    TiffCompression.None
  );
  const width = await ifd.getSingleNumber(TiffTag.ImageWidth, stream);
  const height = await ifd.getSingleNumber(TiffTag.ImageLength, stream);
  const nativeBitsPerSample =
    (floatBitsPerSample as PixelDepth) ?? bitsPerSample;
  const { stripEncoder, rowEncoder } = await createTiffDecompressor({
    compressionId,
    rowsPerStrip,
    rowSize: stripRowSize,
    depth: nativeBitsPerSample,
    ifd,
    stream,
  });
  if (stripEncoder) stripHandlers.push(stripEncoder);
  if (rowEncoder) rowHandlers.push(rowEncoder);

  if (nativeBitsPerSamples) {
    // Битовый экспандер берет весь блок распакованных данных
    // Это не совсем оптимально. Было бы лучше построчно.
    // Но битовые поля упакованы без учёта разрыва строк.
    stripHandlers.push((src, stripSize) =>
      expandBitSamples(nativeBitsPerSamples, src, stripSize)
    );
    needNumFmtCvt = false; // Потому что данные собираются из битов сразу в нужном формате
  }

  // Predictor
  const predId = await ifd.getSingleNumber<TiffPredictor>(
    TiffTag.Predictor,
    stream,
    TiffPredictor.None
  );
  if (predId === TiffPredictor.FloatingPoint) {
    needNumFmtCvt = false;
    // нужна функция, которая скопирует неполные строки в исходном формате.
    // затем предиктор обработает эти данные.
    // И только после этого можно преобразовать нестандартные числовые форматы в стандартный
    rowHandlers.push((src, srcPos, dst) => {
      copyBytes(width * nativeBitsPerSample, src, srcPos, dst, 0);
    });
  }
  const predictor = createTiffPredictor(
    predId,
    nativeBitsPerSample,
    samplesCount
  );

  if (photoInt === PhotometricInterpretation.WhiteIsZero) {
    rowHandlers.push((src, srcPos, dst) => {
      let si = srcPos;
      let di = 0;
      while (di < rowSize) {
        // eslint-disable-next-line no-param-reassign
        dst[di++] = ~src[si++]!;
      }
    });
  }

  if (floatBitsPerSample) {
    const wLength = width * samplesCount;
    const nonStdFloatDict: Record<
      number,
      (
        n: number,
        src: Uint8Array,
        srcPos: number,
        dst: Uint8Array | Float32Array,
        littleEndian?: boolean
      ) => void
    > = {
      16: copyFloat16to32,
      24: copyFloat24to32,
    };
    const fnCopy = nonStdFloatDict[floatBitsPerSample];
    if (fnCopy) {
      const tmp = new Uint8Array(
        (width * nativeBitsPerSample * samplesCount) / 8
      );
      rowHandlers.push((src, srcPos, dst) => {
        copyBytes(tmp.length, src, srcPos, tmp, 0);
        // после предиктора порядок байтов уже соответствует текущей платформе
        fnCopy(wLength, tmp, 0, dst, predictor ? undefined : littleEndian);
      });
    } else
      throw new ErrorRI("Unsupported float <n> bit/sample", {
        n: floatBitsPerSample,
      });
    needNumFmtCvt = false;
  }

  if (needNumFmtCvt) {
    // Endianness
    const numDict: Record<number, FnNumberConversion> = {
      16: decodeWords,
      32: decodeDwords,
      64: decodeQwords,
    };
    const numFmt = numDict[bitsPerSample];
    if (numFmt) {
      rowHandlers.push((src, srcPos, dst) =>
        numFmt(littleEndian, width * samplesCount, src, srcPos, dst, 0)
      );
    }
  }

  return stripsReader({
    offsets,
    sizes,
    stripHandlers,
    rowHandlers,
    stream,
    predictor,
    rowSize,
    stripRowSize,
    width,
    height,
    rowsPerStrip,
  });
};
