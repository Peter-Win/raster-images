import { cvt32to16 } from "../copy/cvt32to16";
import { FnRowOp } from "../FnRowOp";

/**
 * 32-bits per pixel as float32
 */

export const gray32toGray8: FnRowOp = (
  width: number,
  src: Uint8Array,
  dst: Uint8Array
) => {
  const fa = new Float32Array(src.buffer, src.byteOffset);
  let srcPos = 0;
  let dstPos = 0;
  while (dstPos < width) {
    dst[dstPos++] = Math.max(Math.min(fa[srcPos++]! * 255.9, 255), 0);
  }
};

export const gray32toGray16: FnRowOp = (width, src, dst) =>
  cvt32to16(width, src, dst);

// G32A32 -> G16A16
export const grayAlpha32to16: FnRowOp = (width, src, dst) =>
  cvt32to16(2 * width, src, dst);
