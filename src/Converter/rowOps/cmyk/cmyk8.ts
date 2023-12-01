import { FnRowOp } from "../FnRowOp";
import { cvt8to16 } from "../copy/cvt8to16";

export const cmyk8to16: FnRowOp = (width, src, dst) => {
  cvt8to16(4 * width, src, dst);
};

export const cmyka8to16: FnRowOp = (width, src, dst) => {
  cvt8to16(5 * width, src, dst);
};
