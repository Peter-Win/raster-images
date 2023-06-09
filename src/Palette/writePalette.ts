import { RAStream } from "../stream/RAStream";
import { Palette, PaletteOptions } from "./Palette";
import { calcPaletteSize } from "./calcPaletteSize";

export const writePaletteToBuf = (
  palette: Palette,
  buf: Uint8Array,
  options: PaletteOptions
) => {
  const { rgb, dword, bits6 } = options;
  let pos = 0;
  const samples = dword ? 4 : 3;
  for (let i = 0; i < palette.length; i++) {
    const [b, g, r, a] = palette[i]!;
    const c = rgb ? [r, g, b, a] : [b, g, r, a];
    for (let j = 0; j < samples; j++) {
      // eslint-disable-next-line no-param-reassign
      buf[pos++] = bits6 ? c[j]! >> 2 : c[j]!;
    }
  }
};

export const writePalette = async (
  palette: Palette,
  stream: RAStream,
  options: PaletteOptions
) => {
  const size = calcPaletteSize(palette.length, options);
  const buf = new Uint8Array(size);
  writePaletteToBuf(palette, buf, options);
  await stream.write(buf, size);
};
