import { RAStream } from "../stream/RAStream";
import { ImageInfo } from "../ImageInfo";
import { Converter } from "../Converter";
import { Variables } from "../ImageInfo/Variables";

export type FrameType = "image" | "frame" | "preview" | "alpha" | "layer";

export interface BitmapFrame {
  readonly format: BitmapFormat;
  readonly info: ImageInfo;
  readonly type: FrameType;
  readonly offset: number;
  readonly size?: number;
  read(converter: Converter): Promise<void>;
}

export interface BitmapFormat {
  readonly vars: Variables;
  readonly stream: RAStream;
  readonly frames: BitmapFrame[];
}
