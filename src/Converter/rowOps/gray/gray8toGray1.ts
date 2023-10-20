import { FnRowOpDithering } from "../../factories";
import { FnRowOp } from "../FnRowOp";

/**
 * A quick way to convert grayscale to black and white.
 * But the quality is very bad!
 * Not recommended for use.
 */
export const gray8toGray1Fast: FnRowOp = (width, src, dst) => {
  let srcPos = 0;
  let dstPos = 0;
  let shift = 7;
  let curByte = 0;
  while (srcPos < width) {
    const hiBit = src[srcPos++]! >> 7;
    curByte |= hiBit << shift;
    if (--shift < 0) {
      dst[dstPos++] = curByte;
      curByte = 0;
      shift = 7;
    }
  }
  if (shift < 7) {
    dst[dstPos] = curByte;
  }
};

/**
 * Recommended case using dithering
 */
export const gray8toGray1Dither: FnRowOpDithering = (width, src, dst, ctx) => {
  ctx.startLine();
  for (let i = 0; i < width; i++) {
    const x = ctx.getX();
    const srcValue = src[x]!;
    const newValue = ctx.getNew(0, srcValue);
    const dstValue = newValue < 128 ? 0 : 255;
    ctx.setError(0, newValue - dstValue);
    const dstPos = x >> 3;
    const mask = 0x80 >> (x & 7);
    if (dstValue) {
      dst[dstPos] |= mask;
    } else {
      dst[dstPos] &= ~mask;
    }
    ctx.nextPixel();
  }
};
