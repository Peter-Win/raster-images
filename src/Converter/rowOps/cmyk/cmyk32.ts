import { FnRowOp } from "../FnRowOp";
import { cvt32to16 } from "../copy/cvt32to16";

export const cmyk32to16: FnRowOp = (width, src, dst) =>
  cvt32to16(width * 4, src, dst);

export const cmyka32to16: FnRowOp = (width, src, dst) =>
  cvt32to16(width * 5, src, dst);
