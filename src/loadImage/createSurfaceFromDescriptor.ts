import { ImageInfo } from "../ImageInfo";
import { TargetImageDescriptor } from "./TargetImageDescriptor";
import { Surface, SurfaceStd } from "../Surface";
import { PixelFormat } from "..";
import { ErrorRI } from "../utils";

export const createSurfaceFromDescriptor = (
  srcImgInfo: ImageInfo,
  descr: TargetImageDescriptor
): Surface => {
  if (typeof descr === "function") {
    return descr(srcImgInfo);
  }
  const { size: srcSize } = srcImgInfo;
  if (descr instanceof Surface) {
    // Если передана уже готовая поверхность, то надо проверить соответствие размеров
    const { size: dstSize } = descr;
    if (!srcSize.equals(dstSize)) {
      throw new ErrorRI("Expected size <src>, but got size <dst>", {
        src: String(srcSize),
        dst: String(dstSize),
      });
    }
    return descr;
  }
  if (descr instanceof PixelFormat) {
    return new SurfaceStd({
      size: srcSize,
      fmt: descr,
    });
  }
  return new SurfaceStd(srcImgInfo);
};
