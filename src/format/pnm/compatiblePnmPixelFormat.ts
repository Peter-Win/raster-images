import { PixelFormat } from "../../PixelFormat";

export const compatiblePnmPixelFormat = (
  srcPixFmt: PixelFormat
): PixelFormat => {
  const { colorModel, signature, maxSampleDepth } = srcPixFmt;
  if (srcPixFmt.maxSampleDepth === 32) {
    return new PixelFormat(colorModel === "Gray" ? "G32" : "R32G32B32");
  }
  if (colorModel === "Gray") {
    if (signature === "G1") return srcPixFmt;
    return new PixelFormat(maxSampleDepth <= 8 ? 8 : 16, "Gray");
  }
  return new PixelFormat(maxSampleDepth <= 8 ? "R8G8B8" : "R16G16B16");
};
