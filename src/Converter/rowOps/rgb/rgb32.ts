import { FnRowOp } from "../FnRowOp";
import { cvt32to16 } from "../copy/cvt32to16";

export const rgb32to16: FnRowOp = (width, src, dst) =>
  cvt32to16(width * 3, src, dst);

// it is possible to src === dst
export const rgb32swap: FnRowOp = (width, src, dst) => {
  const fsrc = new Float32Array(src.buffer, src.byteOffset);
  const fdst = new Float32Array(dst.buffer, dst.byteOffset);
  let srcPos = 0;
  let dstPos = 0;
  const end = width * 3;
  let c0;
  let c1;
  let c2;
  while (srcPos < end) {
    c0 = fsrc[srcPos++]!;
    c1 = fsrc[srcPos++]!;
    c2 = fsrc[srcPos++]!;
    fdst[dstPos++] = c2;
    fdst[dstPos++] = c1;
    fdst[dstPos++] = c0;
  }
};
