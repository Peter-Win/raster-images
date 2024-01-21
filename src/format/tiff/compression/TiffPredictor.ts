import { ErrorRI } from "../../../utils";
import { PixelDepth } from "../../../types";
import {
  FnNumberConversion,
  decode24bits,
  decodeDwords,
  decodeQwords,
  decodeWords,
} from "../../../Converter/rowOps/numbers";

/* eslint no-param-reassign: "off" */

export enum TiffPredictor {
  None = 1,
  HorizontalDifferencing = 2,
  FloatingPoint = 3,
}

/**
 * Предиктор работает после преобразования числовых форматов (для bit/sample > 8).
 * Иначе результаты математических операций будут непредсказуемые.
 * @param width in pixels
 * @param row IN/OUT
 */
export type FnTiffPredictor = (width: number, row: Uint8Array) => void;

/**
 * Horizontal differencing
 */
export const createPredictorHorizDiff = (
  bitPerSample: number,
  nSamples: number
): FnTiffPredictor => {
  switch (bitPerSample) {
    case 8:
      return (width, row) => {
        const sRow = new Int8Array(row.buffer, row.byteOffset);
        let srcPos = 0;
        let dstPos = srcPos + nSamples;
        const end = width * nSamples;
        while (dstPos < end) {
          sRow[dstPos++] += sRow[srcPos++]!;
        }
      };
    case 16:
      // пока не тестировано
      return (width, row) => {
        const sRow = new Int16Array(row.buffer, row.byteOffset);
        let srcPos = 0;
        let dstPos = srcPos + nSamples;
        const end = width * nSamples;
        while (dstPos < end) {
          sRow[dstPos++] += sRow[srcPos++]!;
        }
      };
    default:
      throw new ErrorRI(
        "Can't create horizontal predictor for <n> bits/sample",
        { n: bitPerSample }
      );
  }
};

const numFmtDict: Record<number, FnNumberConversion> = {
  16: decodeWords,
  24: decode24bits,
  32: decodeDwords,
  64: decodeQwords,
};

const createPredictorFP = (
  bitsPerSample: number,
  samplesCount: number
): FnTiffPredictor => {
  const decoder = numFmtDict[bitsPerSample];
  if (!decoder) {
    throw new ErrorRI("Floating point predictor don't support <b> bit/sample", {
      b: bitsPerSample,
    });
  }
  const bytesPerSample = bitsPerSample >> 3; // decoder only exists for bitsPerSample % 8 == 0
  let tmp: Uint8Array | undefined;
  return (width: number, row) => {
    const samplesInRow = samplesCount * width;
    const rowSize = bytesPerSample * samplesInRow;
    let srcPos = 0;
    let dstPos = samplesCount;
    while (dstPos < rowSize) {
      // eslint-disable-next-line no-param-reassign
      row[dstPos++] += row[srcPos++]!;
    }
    tmp = tmp || new Uint8Array(rowSize);
    dstPos = 0;
    for (let x = 0; x < samplesInRow; x++) {
      srcPos = x;
      for (let iByte = 0; iByte < bytesPerSample; iByte++) {
        tmp[dstPos++] = row[srcPos]!;
        srcPos += samplesInRow;
      }
    }
    // TODO: предполагается, что данный предиктор всегда хранит байты в порядке Big Endian
    decoder(false, samplesInRow, tmp, 0, row, 0);
  };
};

export const createTiffPredictor = (
  predictor: TiffPredictor,
  bitsPerSample: PixelDepth,
  samplesCount: number
): FnTiffPredictor | undefined => {
  switch (predictor) {
    case TiffPredictor.HorizontalDifferencing:
      return createPredictorHorizDiff(bitsPerSample, samplesCount);
    case TiffPredictor.FloatingPoint:
      return createPredictorFP(bitsPerSample, samplesCount);
    default:
      return undefined;
  }
};
