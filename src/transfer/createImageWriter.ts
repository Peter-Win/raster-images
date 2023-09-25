import { ErrorRI } from "../utils";
import { PixelFormat } from "../PixelFormat";
import { Surface } from "../Surface";
import { ImageWriter } from "./ImageWriter";
import { SurfaceReader } from "./SurfaceReader";
import { ConverterProps } from "../Converter/ConverterProps";
import { OnProgressInfo } from "./ProgressInfo";

export const createImageWriter = (
  srcImage: Surface,
  dstFmt: PixelFormat,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options?: {
    converterProps?: ConverterProps;
    progress?: OnProgressInfo;
  }
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
