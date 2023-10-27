import { Point } from "../math/Point";
import { ImageInfo } from "./ImageInfo";
import { PixelFormat, ParcelPixelFormat } from "../PixelFormat";

export type ParcelImageInfo = Omit<ImageInfo, "size" | "fmt"> & {
  width: number;
  height: number;
  fmt: ParcelPixelFormat;
};

export const toParcelImageInfo = ({
  size,
  fmt,
  ...rest
}: ImageInfo): ParcelImageInfo => ({
  width: size.x,
  height: size.y,
  fmt: fmt.toParcel(),
  ...rest,
});

export const fromParcelImageInfo = ({
  width,
  height,
  fmt,
  ...rest
}: ParcelImageInfo): ImageInfo => ({
  size: new Point(width, height),
  fmt: PixelFormat.fromParcel(fmt),
  ...rest,
});
