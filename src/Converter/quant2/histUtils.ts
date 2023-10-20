import { Box } from "./Box";
import { HistArray } from "./HistArray";

const findBiggestColorPop = (boxList: readonly Box[]) => {
  let max = 0;
  const { length } = boxList;
  let which = length;
  for (let j = 0; j !== length; ++j) {
    const b: Box = boxList[j]!;
    if (b.colorCount > max && b.isValid) {
      max = b.colorCount;
      which = j;
    }
  }
  return which;
};

const findBiggestVolume = (boxList: readonly Box[]) => {
  let max = 0;
  const { length } = boxList;
  let which = length;
  for (let j = 0; j !== length; j++) {
    const { norm } = boxList[j]!;
    if (norm > max) {
      which = j;
      max = norm;
    }
  }
  return which;
};

export const medianCut = (
  desiredColors: number,
  hist: HistArray,
  boxList: Box[]
) => {
  while (boxList.length < desiredColors) {
    // Select box to split
    // Current algorithm: by population for first half, then by volume
    const k: number =
      boxList.length * 2 <= desiredColors
        ? findBiggestColorPop(boxList)
        : findBiggestVolume(boxList);

    if (k === boxList.length) break; // no splittable boxes left!

    const box1: Box = boxList[k]!;
    const box2 = box1.split(box1.longestAxis, hist);
    boxList.push(box2);
  }
};
