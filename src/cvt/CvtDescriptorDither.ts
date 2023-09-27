import { CvtDescriptor } from "./CvtDescriptor";
import { DitherCtx } from "./dithering/DitherCtx";

export type FnCvtDither = (
  width: number,
  srcBuf: ArrayBuffer,
  srcByteOffset: number,
  dstBuf: ArrayBuffer,
  dstByteOffset: number,
  ctx: DitherCtx
) => void;

export interface CvtDescriptorDither extends CvtDescriptor {
  cvt: FnCvtDither;
}
