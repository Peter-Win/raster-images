import { ImageInfo } from "../ImageInfo";

export interface ImageReader {
  onStart(info: ImageInfo): Promise<void>;
  onFinish?(): Promise<void>;
  getRowBuffer(y: number): Promise<Uint8Array>;
  finishRow(y: number): Promise<void>;
}
