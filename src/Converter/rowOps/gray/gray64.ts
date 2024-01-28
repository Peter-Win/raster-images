import { FnRowOp } from "../FnRowOp";
import { cvt64to32 } from "../copy/cvt64to32";

export const gray64toGray32: FnRowOp = (
  width: number,
  src: Uint8Array,
  dst: Uint8Array
) => {
  cvt64to32(width, src, dst);
};
