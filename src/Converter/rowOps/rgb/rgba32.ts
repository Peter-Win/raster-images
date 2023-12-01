import { FnRowOp } from "../FnRowOp";
import { cvt32to16 } from "../copy/cvt32to16";

export const rgba32to16: FnRowOp = (width, src, dst) => {
  cvt32to16(width * 4, src, dst);
};
