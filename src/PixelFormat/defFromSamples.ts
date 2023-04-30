import { PixelDepth } from "../types";
import { ColorModel } from "../ColorModel";
import { Palette } from "../Palette";
import { Sample, SampleSign } from "../Sample";
import { PixelFormatDef } from "./PixelFormatDef";

const mapSignsToColorModel: Record<string, ColorModel> = {
  BGR: "RGB",
  G: "Gray",
  I: "Indexed",
  CKMY: "CMYK",
};

export const defFromSamples = (
  samples: Sample[],
  palette?: Palette
): PixelFormatDef => {
  const signs: SampleSign[] = [];
  let alpha = false;
  let depth = 0;
  samples.forEach(({ sign, length }) => {
    alpha = alpha || sign === "A" || sign === "J";
    if (sign !== "A" && sign !== "X") signs.push(sign === "J" ? "I" : sign);
    depth += length;
  });
  signs.sort();
  const s = signs.join("");
  const colorModel = mapSignsToColorModel[s] ?? "Unknown";
  return {
    depth: depth as PixelDepth,
    colorModel,
    alpha,
    palette,
  };
};
