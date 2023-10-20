import { Palette, PaletteItem } from "./Palette";

export const createPalette = (count: number): Palette => {
  const pal = new Array<PaletteItem>(count);
  for (let i = 0; i < count; i++) {
    pal[i] = [0, 0, 0, 255];
  }
  return pal;
};

export const createFreePalette = (count: number): Palette => {
  const pal = new Array<PaletteItem>(count);
  for (let i = 0; i < count; i++) {
    pal[i] = [0, 0, 0, 0];
  }
  return pal;
};

export const createGrayPalette = (count: number): Palette => {
  const pal = new Array<PaletteItem>(count);
  const k = 255 / (count - 1);
  for (let i = 0; i < count; i++) {
    const g = Math.round(i * k);
    pal[i] = [g, g, g, 255];
  }
  return pal;
};
