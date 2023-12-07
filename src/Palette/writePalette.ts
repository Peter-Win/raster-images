import { RAStream } from "../stream/RAStream";
import { Palette, PaletteOptions } from "./Palette";
import { calcPaletteSize } from "./calcPaletteSize";

export const writePaletteToBuf = (
  palette: Readonly<Palette>,
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

export const makePaletteBuf = (
  palette: Readonly<Palette>,
  options: PaletteOptions
): Uint8Array => {
  const size = calcPaletteSize(palette.length, options);
  const buf = new Uint8Array(size);
  writePaletteToBuf(palette, buf, options);
  return buf;
};

export const writePalette = async (
  palette: Readonly<Palette>,
  stream: RAStream,
  options: PaletteOptions
) => {
  await stream.write(makePaletteBuf(palette, options));
};
