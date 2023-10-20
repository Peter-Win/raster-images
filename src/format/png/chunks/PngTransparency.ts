import { Palette } from "../../../Palette";

export const buildTransparentPalette = (
  srcPalette: Readonly<Palette>,
  trnsData: Uint8Array
): Readonly<Palette> => {
  if (srcPalette.length !== trnsData.length) {
    return srcPalette;
  }
  return srcPalette.map(([c0, c1, c2], i) => [c0, c1, c2, trnsData[i]!]);
};
