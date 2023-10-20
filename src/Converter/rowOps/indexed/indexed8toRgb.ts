import { Palette } from "../../../Palette";

export type FnOpWithPalette = (
  width: number,
  src: Uint8Array,
  dst: Uint8Array,
  paletteCache: Uint8Array
) => void;

export type FnMakePaletteCache = (pal: Readonly<Palette>) => Uint8Array;

export const makePaletteCacheBgra = (pal: Readonly<Palette>): Uint8Array => {
  const buf = new Uint8Array(pal.length << 2);
  let srcPos = 0;
  let dstPos = 0;
  const srcEnd = srcPos + pal.length;
  while (srcPos < srcEnd) {
    const item = pal[srcPos++]!;
    buf[dstPos++] = item[0]!;
    buf[dstPos++] = item[1]!;
    buf[dstPos++] = item[2]!;
    buf[dstPos++] = item[3]!;
  }
  return buf;
};

export const makePaletteCacheRgba = (pal: Readonly<Palette>): Uint8Array => {
  const buf = new Uint8Array(pal.length << 2);
  let srcPos = 0;
  let dstPos = 0;
  const srcEnd = srcPos + pal.length;
  while (srcPos < srcEnd) {
    const item = pal[srcPos++]!;
    buf[dstPos++] = item[2]!;
    buf[dstPos++] = item[1]!;
    buf[dstPos++] = item[0]!;
    buf[dstPos++] = item[3]!;
  }
  return buf;
};

export const indexed8toRgb24 = (
  width: number,
  src: Uint8Array,
  dst: Uint8Array,
  paletteCache: Uint8Array
) => {
  let srcPos = 0;
  let dstPos = 0;
  while (srcPos < width) {
    let colorPos = src[srcPos++]! << 2;
    dst[dstPos++] = paletteCache[colorPos++]!;
    dst[dstPos++] = paletteCache[colorPos++]!;
    dst[dstPos++] = paletteCache[colorPos++]!;
  }
};

export const indexed8toRgb32 = (
  width: number,
  src: Uint8Array,
  dst: Uint8Array,
  paletteCache: Uint8Array
) => {
  let srcPos = 0;
  let dstPos = 0;
  while (srcPos < width) {
    let colorPos = src[srcPos++]! << 2;
    dst[dstPos++] = paletteCache[colorPos++]!;
    dst[dstPos++] = paletteCache[colorPos++]!;
    dst[dstPos++] = paletteCache[colorPos++]!;
    dst[dstPos++] = paletteCache[colorPos++]!;
  }
};
