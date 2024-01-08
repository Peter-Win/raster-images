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

type ParamsCreateStripsReader = {
  offsets: number[];
  sizes: number[];
  ifd: Ifd;
  stream: RAStream;
  rowSize: number;
  bitsPerSample: PixelDepth;
  samplesCount: number;
};

export const createStripsReader = async (params: ParamsCreateStripsReader) => {
  const { offsets, sizes, ifd, stream, rowSize, bitsPerSample, samplesCount } =
    params;
  const { littleEndian } = ifd;
  const stripHandlers: FnStripHandler[] = [];
  const rowHandlers: FnRowHandler[] = [];
  const photoInt: PhotometricInterpretation = await ifd.getSingleNumber(
    TiffTag.PhotometricInterpretation,
    stream
  );
  // Compression
  const rowsPerStrip = await ifd.getSingleNumber(TiffTag.RowsPerStrip, stream);
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
    rowSize,
    depth: bitsPerSample,
    ifd,
    stream,
  });
  if (stripEncoder) stripHandlers.push(stripEncoder);
  if (rowEncoder) rowHandlers.push(rowEncoder);
  // Number format
  const numDict: Record<number, FnNumberConversion> = {
    16: decodeWords,
    32: decodeDwords,
    64: decodeQwords,
  };
  const numFmt = numDict[bitsPerSample];
  if (numFmt) {
    rowHandlers.push((src, srcPos, dst) =>
      numFmt(littleEndian, width, src, srcPos, dst, 0)
    );
  }

  // Predictor
  const predId = await ifd.getSingleNumber<TiffPredictor>(
    TiffTag.Predictor,
    stream,
    TiffPredictor.None
  );
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

  return stripsReader({
    offsets,
    sizes,
    stripHandlers,
    rowHandlers,
    stream,
    predictor,
    rowSize,
    width,
    height,
    rowsPerStrip,
  });
};
