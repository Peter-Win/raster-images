import { PixelDepth } from "../types";

export const calcPitch = (
  width: number,
  depth: PixelDepth,
  alignBytes?: number
): number => {
  const notAligned = (width * (depth === 15 ? 16 : depth) + 7) >> 3;
  if (!alignBytes) return notAligned;
  return alignBytes * ~~((notAligned + alignBytes - 1) / alignBytes);
};
