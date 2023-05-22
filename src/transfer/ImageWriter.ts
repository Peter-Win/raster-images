import { ImageInfo } from "../ImageInfo";

export interface ImageWriter {
  onStart(info: ImageInfo): Promise<void>;
  onFinish?(): Promise<void>;
  getRowBuffer(y: number): Promise<Uint8Array>;
}
