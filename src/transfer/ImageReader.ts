import { ImageInfo } from "../ImageInfo";
import { OnProgressInfo } from "./ProgressInfo";

export interface ImageReader {
  onStart(info: ImageInfo): Promise<void>;
  onFinish?(): Promise<void>;
  getRowBuffer(y: number): Promise<Uint8Array>;
  finishRow(y: number): Promise<void>;
  progress?: OnProgressInfo;
}
