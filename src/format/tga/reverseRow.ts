// Алгоритм не очень быстрый,
// но ситуация по развороту пикселей встрецается очень редко.

/* eslint "no-param-reassign": "off" */

export const reverseRow = (
  width: number,
  row: Uint8Array,
  bytesPerPixel: number
) => {
  let leftPos = 0;
  let rightPos = (width - 1) * bytesPerPixel;
  let tmp: number;
  let i: number;
  while (leftPos < rightPos) {
    for (i = 0; i < bytesPerPixel; i++) {
      tmp = row[leftPos + i]!;
      row[leftPos + i] = row[rightPos + i]!;
      row[rightPos + i] = tmp;
    }
    leftPos += bytesPerPixel;
    rightPos -= bytesPerPixel;
  }
};
