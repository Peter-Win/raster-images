import { CvtDescriptorDirect } from "../cvt";
import { CommonRowConverter } from "./CommonRowConverter";

export class SimpleRowConverter extends CommonRowConverter {
  constructor(
    srcSign: string,
    dstSign: string,
    descriptor: CvtDescriptorDirect
  ) {
    super(srcSign, dstSign, descriptor, descriptor.cvt);
  }
}
