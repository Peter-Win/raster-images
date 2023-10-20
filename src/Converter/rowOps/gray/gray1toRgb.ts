import { FnRowOp } from "../FnRowOp";

export const gray1toRgb24: FnRowOp = (width, src, dst) => {
  let srcPos = 0;
  let mask = 0;
  let curByte = 0;
  let dstPos = 0;
  const dstEnd = width * 3;
  while (dstPos < dstEnd) {
    if (mask === 0) {
      mask = 0x80;
      curByte = src[srcPos++]!;
    }
    const g = curByte & mask ? 0xff : 0;
    dst[dstPos++] = g;
    dst[dstPos++] = g;
    dst[dstPos++] = g;
    mask >>= 1;
  }
};

// G1 => RGBA or RGBX (R8G8B8A8 or B8G8R8A8 or R8G8B8X8 or B8G8R8X8)
export const gray1toRgba32: FnRowOp = (width, src, dst) => {
  let srcPos = 0;
  let mask = 0;
  let curByte = 0;
  let dstPos = 0;
  const dstEnd = width * 4;
  while (dstPos < dstEnd) {
    if (mask === 0) {
      mask = 0x80;
      curByte = src[srcPos++]!;
    }
    const g = curByte & mask ? 0xff : 0;
    dst[dstPos++] = g;
    dst[dstPos++] = g;
    dst[dstPos++] = g;
    dst[dstPos++] = 0xff;
    mask >>= 1;
  }
};
