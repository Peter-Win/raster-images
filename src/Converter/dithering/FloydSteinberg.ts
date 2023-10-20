// Declarations for Floyd-Steinberg dithering.
//
// Errors are accumulated into the arrays evenrowerrs[] and oddrowerrs[].
// These have resolutions of 1/16th of a pixel count.  The error at a given
// pixel is propagated to its unprocessed neighbors using the standard F-S
// fractions,
//		...	(here)	7/16
//		3/16	5/16	1/16
// We work left-to-right on even rows, right-to-left on odd rows.
//
// Each of the arrays has (#columns + 2) entries; the extra entry
// at each end saves us from special-casing the first and last pixels.
// Each entry is three values long.
// In evenrowerrs[], the entries for a component are stored left-to-right, but
// in oddrowerrs[] they are stored right-to-left.  This means we always
// process the current row's error entries in increasing order and the next
// row's error entries in decreasing order, regardless of whether we are
// working L-to-R or R-to-L in the pixel data!

import { PixelFormat } from "../../PixelFormat";
import { rangeLimit, rangeLimit16 } from "../../utils";
import { DitherCtx } from "./DitherCtx";

/**
 * Вариант для случая, когда исходный цвет имеет байтовые компоненты. Н.р. B8G8R8 or G8
 */
export const createFloydSteinberg8 = (
  width: number,
  samplesCount: number
): DitherCtx => {
  const errRowSize = samplesCount * (width + 2);
  const evenrowerrs = new Int16Array(errRowSize);
  const oddrowerrs = new Int16Array(errRowSize);
  let isOddRow = true;
  let thisrowerr = evenrowerrs;
  let nextrowerr = oddrowerrs;
  let nextPos = 0;
  let thisPos = 0;
  let dir = 0;
  let x = 0;
  return {
    startLine() {
      isOddRow = !isOddRow;
      thisrowerr = isOddRow ? oddrowerrs : evenrowerrs;
      nextrowerr = isOddRow ? evenrowerrs : oddrowerrs;
      dir = isOddRow ? -1 : 1;
      x = isOddRow ? width - 1 : 0;
      thisPos = samplesCount;
      nextPos = width * samplesCount;
      // need only initialize this one entry in nextrowerr
      nextrowerr.fill(0, nextPos, nextPos + samplesCount);
    },
    getX() {
      return x;
    },
    getNew(sampleIndex: number, sampleValue: number): number {
      const correction = (thisrowerr[thisPos + sampleIndex]! + 8) >> 4;
      return rangeLimit(sampleValue + correction);
    },
    setError(sampleIndex: number, errorValue: number) {
      const err2 = errorValue * 2;
      let value = errorValue;
      nextrowerr[nextPos + sampleIndex - samplesCount] = value; // not +=, since not initialized yet
      value += err2; // form error * 3
      nextrowerr[nextPos + sampleIndex + samplesCount] += value;
      value += err2; // form error * 5
      nextrowerr[nextPos + sampleIndex] += value;
      value += err2; // form error * 7
      thisrowerr[thisPos + sampleIndex + samplesCount] += value;
    },
    nextPixel() {
      thisPos += samplesCount;
      nextPos -= samplesCount;
      x += dir;
    },
  };
};

/**
 * Вариант для случая, когда исходный цвет имеет 2-байтовые компоненты. Н.р. B16G16R16 or G16
 */
export const createFloydSteinberg16 = (
  width: number,
  samplesCount: number
): DitherCtx => {
  const errRowSize = samplesCount * (width + 2);
  const evenrowerrs = new Int32Array(errRowSize);
  const oddrowerrs = new Int32Array(errRowSize);
  let isOddRow = true;
  let thisrowerr = evenrowerrs;
  let nextrowerr = oddrowerrs;
  let nextPos = 0;
  let thisPos = 0;
  let dir = 0;
  let x = 0;
  return {
    startLine() {
      isOddRow = !isOddRow;
      thisrowerr = isOddRow ? oddrowerrs : evenrowerrs;
      nextrowerr = isOddRow ? evenrowerrs : oddrowerrs;
      dir = isOddRow ? -1 : 1;
      x = isOddRow ? width - 1 : 0;
      thisPos = samplesCount;
      nextPos = width * samplesCount;
      // need only initialize this one entry in nextrowerr
      nextrowerr.fill(0, nextPos, nextPos + samplesCount);
    },
    getX() {
      return x;
    },
    getNew(sampleIndex: number, sampleValue: number): number {
      const correction = (thisrowerr[thisPos + sampleIndex]! + 8) >> 4;
      return rangeLimit16(sampleValue + correction);
    },
    setError(sampleIndex: number, errorValue: number) {
      //  prev  current  7/16
      //  1/16   5/16    3/16
      // Здесь 3/16 и 1/16 перевернуты, по сравнению с классическим алгоритмом,
      // т.к. используется разнонаправленный обход четных и нечетных строк
      const err2 = errorValue * 2;
      let value = errorValue;
      nextrowerr[nextPos + sampleIndex - samplesCount] = value; // not +=, since not initialized yet
      value += err2; // form error * 3
      nextrowerr[nextPos + sampleIndex + samplesCount] += value;
      value += err2; // form error * 5
      nextrowerr[nextPos + sampleIndex] += value;
      value += err2; // form error * 7
      thisrowerr[thisPos + sampleIndex + samplesCount] += value;
    },
    nextPixel() {
      thisPos += samplesCount;
      nextPos -= samplesCount;
      x += dir;
    },
  };
};

export const createFloydSteinberg = (
  width: number,
  pixFmt: PixelFormat
): DitherCtx => {
  if (pixFmt.samples[0]?.length === 16) {
    return createFloydSteinberg16(width, pixFmt.samples.length);
  }
  return createFloydSteinberg8(width, pixFmt.samples.length);
};
