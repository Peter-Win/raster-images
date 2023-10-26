import { PixelDepth } from "../../types";
import { PixelFormat } from "../../PixelFormat";
import { createGrayPalette } from "../../Palette";

export const compatibleBmpPixelFormat = (
  srcPixFmt: PixelFormat
): PixelFormat => {
  if (srcPixFmt.colorModel === "Indexed") {
    return srcPixFmt;
  }
  if (srcPixFmt.colorModel === "Gray") {
    const depth = Math.min(srcPixFmt.depth, 8) as PixelDepth;
    return new PixelFormat({
      colorModel: "Indexed",
      depth,
      palette: createGrayPalette(1 << depth),
    });
  }
  if (srcPixFmt.colorModel !== "RGB" || srcPixFmt.depth > 32) {
    return new PixelFormat(srcPixFmt.alpha ? 32 : 24);
  }
  return new PixelFormat(srcPixFmt.depth);
};
