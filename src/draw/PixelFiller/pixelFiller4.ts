import { PixelFiller } from "./PixelFiller";

/* eslint no-param-reassign: "off" */

export const pixelFiller4: PixelFiller = (
  { src, srcOffset, dst, dstOffset },
  srcX,
  dstX
) => {
  const srcPos = (srcOffset || 0) + (srcX >> 1);
  const dstPos = (dstOffset || 0) + (dstX >> 1);
  const srcShift = ((srcX & 1) ^ 1) << 2;
  const pixelValue = (src[srcPos]! >> srcShift) & 0xf;
  const dstShift = ((dstX & 1) ^ 1) << 2;
  const dstMask = 0xf0 >> dstShift;
  dst[dstPos] = (dst[dstPos]! & dstMask) | (pixelValue << dstShift);
};
