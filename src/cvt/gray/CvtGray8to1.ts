import { CvtDescriptorDirect } from "../CvtDescriptor";
import { CvtDescriptorDither } from "../CvtDescriptorDither";

/**
 * A quick way to convert grayscale to black and white.
 * But the quality is very bad.
 */
export const CvtGray8to1Fast: CvtDescriptorDirect = {
  loss: true,
  speed: 100,
  quality: 1,
  cvt: (
    width: number,
    srcBuf: ArrayBuffer, // Gray8, 1 pixel = 1 byte
    srcByteOffset: number,
    dstBuf: ArrayBuffer, // B&W, 8 pixels = 1 byte
    dstByteOffset: number
  ) => {
    const src = new Uint8Array(srcBuf, srcByteOffset);
    const dst = new Uint8Array(dstBuf, dstByteOffset);
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
  },
};

/**
 * Recommended case
 * Use dithering
 */
export const CvtGray8to1Dither: CvtDescriptorDither = {
  loss: true,
  dithering: true,
  speed: 60,
  quality: 60,
  cvt: (
    width: number,
    srcBuf: ArrayBuffer, // Gray8, 1 pixel = 1 byte
    srcByteOffset: number,
    dstBuf: ArrayBuffer, // B&W, 8 pixels = 1 byte
    dstByteOffset: number,
    ctx
  ) => {
    const src = new Uint8Array(srcBuf, srcByteOffset);
    const dst = new Uint8Array(dstBuf, dstByteOffset);
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
  },
};
