import { PixelDepth } from "../../../types";

export enum TiffPredictor {
  None = 1,
  HorizontalDifferencing = 2,
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
export const createPredictorHorizDiff =
  (bitPerSample: number, nSamples: number): FnTiffPredictor =>
  // Пока версия для bitPerSample = 8
  (width, row) => {
    const sRow = new Int8Array(row.buffer, row.byteOffset);
    let srcPos = 0;
    let dstPos = srcPos + nSamples;
    const end = width * nSamples;
    while (dstPos < end) {
      sRow[dstPos++] += sRow[srcPos++]!;
    }
  };
// throw Error("Have no predictor for "+pixFmt.signature);

export const createTiffPredictor = (
  predictor: TiffPredictor,
  bitsPerSample: PixelDepth,
  samplesCount: number
): FnTiffPredictor | undefined => {
  if (predictor === TiffPredictor.HorizontalDifferencing) {
    return createPredictorHorizDiff(bitsPerSample, samplesCount);
  }
  return undefined;
};
