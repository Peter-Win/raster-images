import { Surface } from "../Surface";
import { PixelFormat } from "../PixelFormat";
import { ImageInfo } from "../ImageInfo";

export type FnCreateImage = (info: ImageInfo) => Surface;

export type TargetImageDescriptor =
  | Surface
  | PixelFormat
  | FnCreateImage
  | undefined;
