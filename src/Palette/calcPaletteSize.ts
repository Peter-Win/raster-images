import { PaletteOptions } from "./Palette";

export const calcPaletteSize = (
  length: number,
  options: PaletteOptions
): number => length * (options.dword ? 4 : 3);
