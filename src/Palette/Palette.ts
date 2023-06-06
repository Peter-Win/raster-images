export type PaletteItem = [number, number, number, number];
export type Palette = PaletteItem[];

export type PaletteOptions = {
  dword?: boolean | "opaque";
  bits6?: boolean;
  rgb?: boolean; // default order: b,g,r
};
