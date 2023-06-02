import { PixelFormat } from "../PixelFormat";
import { Surface } from "../Surface";
import { ImageWriter } from "./ImageWriter";
import { createImageWriter } from "./createImageWriter";

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
