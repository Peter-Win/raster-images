import { FnRowOp } from "../FnRowOp";

export const swapRedBlue24: FnRowOp = (width, src, dst) => {
  let srcPos = 0;
  let dstPos = 0;
  const dstEnd = width * 3;
  while (dstPos < dstEnd) {
    const c0 = src[srcPos++]!;
    const c1 = src[srcPos++]!;
    const c2 = src[srcPos++]!;
    dst[dstPos++] = c2;
    dst[dstPos++] = c1;
    dst[dstPos++] = c0;
  }
};

export const swapRedBlue32: FnRowOp = (width, src, dst) => {
  let srcPos = 0;
  let dstPos = 0;
  const dstEnd = width * 4;
  while (dstPos < dstEnd) {
    const c0 = src[srcPos++]!;
    const c1 = src[srcPos++]!;
    const c2 = src[srcPos++]!;
    const c3 = src[srcPos++]!;
    dst[dstPos++] = c2;
    dst[dstPos++] = c1;
    dst[dstPos++] = c0;
    dst[dstPos++] = c3;
  }
};
