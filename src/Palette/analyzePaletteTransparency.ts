import { Palette } from "./Palette";

export type PaletteTransparency = "opaque" | "transparency" | "alpha";

type WithoutParams = { type: "opaque" | "alpha" };

// Palette with a single transparent color
type WithIndex = { type: "transparency"; index: number };

export type AnalyzePaletteTransparencyResult = WithoutParams | WithIndex;

export const analyzePaletteTransparency = (
  palette: Readonly<Palette>
): AnalyzePaletteTransparencyResult => {
  let index = -1;
  for (let i = 0; i < palette.length; i++) {
    const a = palette[i]![3];
    if (a < 255) {
      if (index < 0 && a === 0) {
        index = i;
      } else {
        return { type: "alpha" };
      }
    }
  }
  return index >= 0 ? { type: "transparency", index } : { type: "opaque" };
};
