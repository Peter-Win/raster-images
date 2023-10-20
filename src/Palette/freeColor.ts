import { PaletteItem } from "./Palette";

export const isFreeColor = (pal: PaletteItem): boolean =>
  pal[0] === 0 && pal[1] === 0 && pal[2] === 0 && pal[3] === 0;
