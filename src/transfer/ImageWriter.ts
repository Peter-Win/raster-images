import { ImageInfo } from "../ImageInfo";
import { OnProgressInfo } from "./ProgressInfo";

export interface ImageWriter {
  onStart(info: ImageInfo): Promise<void>;
  onFinish?(): Promise<void>;
  getRowBuffer(y: number): Promise<Uint8Array>;
  progress?: OnProgressInfo;
}
