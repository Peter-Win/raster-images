import { RAStream } from "../../stream";
import { TiffTag } from "./TiffTag";
import { createTiffDecompressor } from "./compression/createTiffDecompressor";
import { Ifd } from "./ifd/Ifd";
import { FnRowHandler, FnStripHandler, stripsReader } from "./stripsReader";
import { TiffCompression } from "./tags/TiffCompression";
import {
  TiffPredictor,
  createTiffPredictor,
} from "./compression/TiffPredictor";
import {
  FnNumberConversion,
  decodeDwords,
  decodeQwords,
  decodeWords,
} from "../../Converter/rowOps/numbers";
import { PixelDepth } from "../../types";
import { PhotometricInterpretation } from "./tags/PhotometricInterpretation";
import { ErrorRI } from "../../utils";
import { expandBitSamples } from "./compression/expandBitSamples";
import { getFloat16 } from "../../math/float16";

type ParamsCreateStripsReader = {
  offsets: number[];
  sizes: number[];
  ifd: Ifd;
  stream: RAStream;
  rowSize: number;
  bitsPerSample: PixelDepth;
  samplesCount: number;
  nativeBitsPerSamples?: number[];
  float16?: boolean;
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
    float16,
  } = params;
  const { littleEndian } = ifd;
  let needNumFmtCvt = bitsPerSample > 8;
  const stripHandlers: FnStripHandler[] = [];
  const rowHandlers: FnRowHandler[] = [];
  const photoInt: PhotometricInterpretation = await ifd.getSingleNumber(
    TiffTag.PhotometricInterpretation,
    stream
  );
  const stripRowSize = float16 ? rowSize >> 1 : rowSize;
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
  const { stripEncoder, rowEncoder } = await createTiffDecompressor({
    compressionId,
    rowsPerStrip,
    rowSize: stripRowSize,
    depth: float16 ? 16 : bitsPerSample,
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
  if (predId === TiffPredictor.FloatingPoint) needNumFmtCvt = false;
  const predictor = createTiffPredictor(predId, bitsPerSample, samplesCount);

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

  if (float16) {
    const wLength = width * samplesCount;
    const wtmp = new Uint16Array(wLength);
    const btmp = new Uint8Array(wtmp.buffer, wtmp.byteOffset);
    rowHandlers.push((src, srcPos, dst) => {
      decodeWords(littleEndian, wLength, src, srcPos, btmp, 0);
      const fdst = new Float32Array(dst.buffer, dst.byteOffset);
      for (let i = 0; i < wLength; i++) {
        fdst[i] = getFloat16(wtmp[i]!);
      }
    });
    needNumFmtCvt = false;
  }

  if (needNumFmtCvt) {
    // Number format
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
