import { FnRowOp } from "../FnRowOp";

export const gray1toGray8: FnRowOp = (width, src, dst) => {
  let srcPos = 0;
  let mask = 0;
  let curByte = 0;
  let dstPos = 0;
  const dstEnd = width;
  while (dstPos < dstEnd) {
    if (mask === 0) {
      mask = 0x80;
      curByte = src[srcPos++]!;
    }
    dst[dstPos++] = curByte & mask ? 0xff : 0;
    mask >>= 1;
  }
};
