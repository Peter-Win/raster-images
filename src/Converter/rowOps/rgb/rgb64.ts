import { FnRowOp } from "../FnRowOp";
import { cvt64to32 } from "../copy/cvt64to32";

export const rgbFloat64to32: FnRowOp = (width, src, dst) =>
  cvt64to32(width * 3, src, dst);
