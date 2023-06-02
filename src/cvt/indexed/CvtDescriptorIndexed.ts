import { Palette } from "../../Palette";
import { CvtDescriptor } from "../CvtDescriptor";

export type FnCvtIndexed = (
  width: number,
  srcBuf: ArrayBuffer,
  srcOffset: number,
  dstBuf: ArrayBuffer,
  dstOffset: number,
  paletteCache: Uint8Array
) => void;

export type FnMakePaletteCache = (pal: Palette) => Uint8Array;

export interface CvtDescriptorIndexed extends CvtDescriptor {
  cvt: FnCvtIndexed;
  makePaletteCache: FnMakePaletteCache;
}
