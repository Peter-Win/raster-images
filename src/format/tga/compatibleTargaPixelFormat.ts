import { PixelFormat } from "../../PixelFormat";

export const compatibleTargaPixelFormat = (
  srcPixFmt: PixelFormat
): PixelFormat => {
  if (srcPixFmt.alpha) {
    return new PixelFormat("B8G8R8A8");
  }
  if (srcPixFmt.colorModel === "RGB" && srcPixFmt.depth <= 16) {
    return new PixelFormat("B5G5R5");
  }
  if (srcPixFmt.colorModel === "Indexed") {
    return new PixelFormat({
      depth: 8,
      colorModel: "Indexed",
      palette: srcPixFmt.palette,
    });
  }
  if (srcPixFmt.colorModel === "Gray") {
    return new PixelFormat("G8");
  }
  return new PixelFormat("B8G8R8");
};
