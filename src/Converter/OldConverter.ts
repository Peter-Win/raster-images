import { ImageReader } from "../transfer/ImageReader";
import { CvtDescriptor } from "../cvt";
import { OnProgressInfo } from "../transfer/ProgressInfo";

/**
 * @deprecated
 */
export interface OldConverter {
  readonly srcSign: string;
  readonly dstSign: string;
  readonly descriptor: CvtDescriptor;
  createReader(nextReader: ImageReader, progress?: OnProgressInfo): ImageReader;
}
