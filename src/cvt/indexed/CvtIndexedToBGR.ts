import { Palette } from "../../Palette";
import { CvtDescriptorIndexed } from "./CvtDescriptorIndexed";

export const makePaletteCache32 = (pal: Readonly<Palette>): Uint8Array => {
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

export const makePaletteCacheRGBA = (pal: Readonly<Palette>): Uint8Array => {
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

export const CvtIndexed8To24: CvtDescriptorIndexed = {
  loss: false,
  speed: 50,
  quality: 100,
  makePaletteCache: makePaletteCache32,
  cvt: (
    width: number,
    srcBuf: ArrayBuffer,
    srcOffset: number,
    dstBuf: ArrayBuffer,
    dstOffset: number,
    paletteCache: Uint8Array
  ): void => {
    const src = new Uint8Array(srcBuf, srcOffset, width);
    const dst = new Uint8Array(dstBuf, dstOffset, width * 3);
    let srcPos = 0;
    let dstPos = 0;
    while (srcPos < width) {
      let colorPos = src[srcPos++]! << 2;
      dst[dstPos++] = paletteCache[colorPos++]!;
      dst[dstPos++] = paletteCache[colorPos++]!;
      dst[dstPos++] = paletteCache[colorPos++]!;
    }
  },
};

// Предполагается, что этот алгоритм быстрее, чем для 24 за счет использования 32-битовых операций
// 24-битовое преобразование использует 4 операции (1 чтения и 3 записи)
// 32-битовое - 2 операции (1 чтение и 2 запись)
// Хотя возможны всякие случаи.
// Например, некоторые виды оперативной памяти будут работать в 2 раза медленнее,
// если целевой буфер не выровнен на 4 байта.
export const CvtIndexed8To32: CvtDescriptorIndexed = {
  loss: false,
  speed: 70,
  quality: 100,
  makePaletteCache: makePaletteCache32,
  cvt: (
    width: number,
    srcBuf: ArrayBuffer,
    srcOffset: number,
    dstBuf: ArrayBuffer,
    dstOffset: number,
    paletteCache: Uint8Array
  ): void => {
    const src = new Uint8Array(srcBuf, srcOffset, width);
    const dst = new Uint32Array(dstBuf, dstOffset, width);
    const pal32 = new Uint32Array(
      paletteCache.buffer,
      paletteCache.byteOffset,
      paletteCache.length >> 2
    );
    let pos = 0;
    while (pos < width) {
      dst[pos] = pal32[src[pos]!]!;
      pos++;
    }
  },
};

export const CvtIndexed8ToRGBA: CvtDescriptorIndexed = {
  ...CvtIndexed8To32,
  makePaletteCache: makePaletteCacheRGBA,
};
