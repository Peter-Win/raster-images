import { PixelFiller } from "./PixelFiller";

/* eslint no-param-reassign: "off" */

export const pixelFillerN =
  (bytesPerPixel: number): PixelFiller =>
  ({ src, srcOffset, dst, dstOffset }, srcX, dstX) => {
    let srcPos = (srcOffset || 0) + srcX * bytesPerPixel;
    let dstPos = (dstOffset || 0) + dstX * bytesPerPixel;
    for (let i = 0; i < bytesPerPixel; i++) {
      dst[dstPos++] = src[srcPos++]!;
    }
  };
