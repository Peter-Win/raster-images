import { ImageReader } from "../transfer/ImageReader";
import { CvtDescriptor } from "../cvt";

export interface Converter {
  readonly srcSign: string;
  readonly dstSign: string;
  readonly descriptor: CvtDescriptor;
  createReader(nextReader: ImageReader): ImageReader;
}
