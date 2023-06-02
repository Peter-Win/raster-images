import { allConverters } from "../Converter/allConverters";
import { PixelFormat } from "../PixelFormat";
import { Surface } from "../Surface";
import { ErrorRI } from "../utils";
import { ImageReader } from "./ImageReader";
import { SurfaceReader } from "./SurfaceReader";

export const createImageReader = (
  srcPixFmt: PixelFormat,
  dstImage: Surface
): ImageReader => {
  const dstPixFmt = dstImage.info.fmt;
  if (srcPixFmt.equals(dstPixFmt)) {
    return new SurfaceReader(dstImage);
  }
  // TODO: Пока самый простой вариант - поиск подходящего конвертера
  const srcSignNeed = srcPixFmt.signature;
  const dstSignNeed = dstImage.info.fmt.signature;
  const factory = allConverters.find(
    ({ srcSign, dstSign }) => srcSign === srcSignNeed && dstSign === dstSignNeed
  );
  if (!factory) {
    throw new ErrorRI("Can't find pixel converter from <src> to <dst>", {
      src: String(srcPixFmt),
      dst: String(dstPixFmt),
    });
  }
  return factory.createReader(new SurfaceReader(dstImage));
};
