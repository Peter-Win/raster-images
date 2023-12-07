import { PixelFormat } from "../../../PixelFormat";

export const compatiblePngPixelFormat = (
  srcPixFmt: PixelFormat
): PixelFormat => {
  if (srcPixFmt.colorModel === "Indexed") {
    return srcPixFmt;
  }
  const sampleDepth = srcPixFmt.maxSampleDepth;
  let sign: string;
  if (srcPixFmt.colorModel === "Gray") {
    if (srcPixFmt.alpha) {
      sign = sampleDepth <= 8 ? "G8A8" : "G16A16";
    } else {
      sign = `G${Math.min(sampleDepth, 16)}`;
    }
  } else {
    const depth = sampleDepth <= 8 ? 8 : 16;
    sign = `R${depth}G${depth}B${depth}`;
    if (srcPixFmt.alpha) sign += `A${depth}`;
  }
  return new PixelFormat(sign);
};
