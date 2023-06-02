import { PixelFormat } from "../PixelFormat";
import { Surface } from "../Surface";
import { ImageReader } from "./ImageReader";
import { createImageReader } from "./createImageReader";

export const readImagePattern = async (
  reader: ImageReader,
  srcPixFmt: PixelFormat,
  dstImage: Surface,
  read: (reader: ImageReader) => Promise<void>
): Promise<void> => {
  await reader.onStart({
    ...dstImage.info,
    fmt: srcPixFmt,
  });
  await read(reader);
  if (reader.onFinish) {
    await reader.onFinish();
  }
};

export const readImage = async (
  srcPixFmt: PixelFormat,
  dstImage: Surface,
  read: (reader: ImageReader) => Promise<void>
): Promise<void> => {
  await readImagePattern(
    createImageReader(srcPixFmt, dstImage),
    srcPixFmt,
    dstImage,
    read
  );
};
