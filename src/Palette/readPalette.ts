import { RAStream } from "../stream/RAStream";
import { Palette, PaletteItem, PaletteOptions } from "./Palette";
import { calcPaletteSize } from "./calcPaletteSize";

export const readPalette = async (
  stream: RAStream,
  colorsCount: number,
  options: PaletteOptions
): Promise<Palette> => {
  const size = calcPaletteSize(colorsCount, options);
  const buf = await stream.read(size);
  return readPaletteFromBuf(buf, colorsCount, options);
};

export const readPaletteFromBuf = (
  buf: Uint8Array,
  colorsCount: number,
  options: PaletteOptions
): Palette => {
  const pal: Palette = new Array(colorsCount);
  let srcPos = 0;
  const { rgb, dword, bits6 } = options;
  for (let dstPos = 0; dstPos < colorsCount; dstPos++) {
    const item: PaletteItem = [0, 0, 0, 0xff];
    item[rgb ? 2 : 0] = buf[srcPos++]!;
    item[1] = buf[srcPos++]!;
    item[rgb ? 0 : 2] = buf[srcPos++]!;
    if (dword === true) item[3] = buf[srcPos++]!;
    else if (dword === "opaque") {
      item[3] = 255;
      srcPos++;
    }
    if (bits6) {
      for (let i = 0; i < 3; i++) {
        const b = item[i]!;
        item[i] = (b << 2) | ((b >> 4) & 3);
      }
    }
    pal[dstPos] = item;
  }
  return pal;
};
