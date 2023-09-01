import { PixelFiller } from "./PixelFiller";

/* eslint no-param-reassign: "off" */

export const pixelFiller1: PixelFiller = (
  { src, dst, srcOffset, dstOffset },
  srcX,
  dstX
) => {
  const srcPos = (srcOffset || 0) + (srcX >> 3);
  const dstPos = (dstOffset || 0) + (dstX >> 3);
  const srcMask = 0x80 >> (srcX & 7);
  const dstMask = 0x80 >> (dstX & 7);
  if (src[srcPos]! & srcMask) {
    dst[dstPos] |= dstMask;
  } else {
    dst[dstPos] &= ~dstMask;
  }
};
