import { PixelFiller } from "./PixelFiller";

/* eslint no-param-reassign: "off" */

export const pixelFiller8: PixelFiller = (
  { src, srcOffset, dst, dstOffset },
  srcX,
  dstX
) => {
  dst[(dstOffset || 0) + dstX] = src[(srcOffset || 0) + srcX]!;
};
