import { RAStream } from "../stream/RAStream";
import { ImageInfo } from "../ImageInfo";
import { ImageReader } from "../transfer/ImageReader";

export type FrameType = "image" | "frame" | "preview" | "alpha" | "layer";

export interface BitmapFrame {
  readonly format: BitmapFormat;
  readonly info: ImageInfo;
  readonly type: FrameType;
  readonly offset: number;
  readonly size: number;
  read(stream: RAStream, reader: ImageReader): Promise<void>;
}

export interface BitmapFormat {
  readonly frames: BitmapFrame[];
}
