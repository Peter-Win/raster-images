import { ErrorRI } from "../utils";
import { PixelFormat } from "../PixelFormat";
import { Surface } from "../Surface";
import { ImageWriter } from "./ImageWriter";
import { SurfaceReader } from "./SurfaceReader";

export const createImageWriter = (
  srcImage: Surface,
  dstFmt: PixelFormat
): ImageWriter => {
  const srcFmt = srcImage.info.fmt;
  if (srcFmt.equals(dstFmt)) {
    return new SurfaceReader(srcImage);
  }
  throw new ErrorRI("Can't find pixel converter from <src> to <dst>", {
    src: String(srcFmt),
    dst: String(dstFmt),
  });
};

export const writeImage = async (
  srcImage: Surface,
  dstFmt: PixelFormat,
  write: (writer: ImageWriter) => Promise<void>
): Promise<void> => {
  const writer = createImageWriter(srcImage, dstFmt);
  await writer.onStart(srcImage.info);
  await write(writer);
  if (writer.onFinish) {
    await writer.onFinish();
  }
};
