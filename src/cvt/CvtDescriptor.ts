import { FnCvt } from "./FnCvt";

export interface CvtDescriptor {
  dithering?: boolean;
  loss: boolean;
  speed: number; // [0:100]
  quality: number; // [0:100]
}

export interface CvtDescriptorDirect extends CvtDescriptor {
  cvt: FnCvt;
}
