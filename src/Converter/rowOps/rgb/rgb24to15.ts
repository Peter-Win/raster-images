// B8G8R8 -> B5G5R5

import { FnRowOpDithering } from "../../factories";
import { FnRowOp } from "../FnRowOp";

// С одной стороны, для алгоритма нет разницы в порядке следования компонентов BGR или RGB.
// Но с другой стороны, 15-битовая упаковка практически всегда используется только для BGR.
// Видимо потому что такой формат поддерживается SVGA-видеокартами.

/**
 * Самый быстрый способ. Но худшее качество.
 * На градиентах будут заметны "ступеньки".
 */
export const rgb24to15Fast: FnRowOp = (width, src, bdst) => {
  const wdst = new Uint16Array(bdst.buffer, bdst.byteOffset);
  let srcPos = 0;
  let dstPos = 0;
  const dstEnd = srcPos + width;
  while (dstPos < dstEnd) {
    const c0 = src[srcPos++]! >> 3;
    const c1 = src[srcPos++]! >> 3;
    const c2 = src[srcPos++]! >> 3;
    wdst[dstPos++] = c0 | (c1 << 5) | (c2 << 10);
  }
};

export const rgb24to15Dither: FnRowOpDithering = (width, src, bdst, ctx) => {
  const wdst = new Uint16Array(bdst.buffer, bdst.byteOffset);
  ctx.startLine();
  for (let i = 0; i < width; i++) {
    const x = ctx.getX();
    const srcPos = x * 3;
    const n0 = ctx.getNew(0, src[srcPos]!);
    const n1 = ctx.getNew(1, src[srcPos + 1]!);
    const n2 = ctx.getNew(2, src[srcPos + 2]!);
    const v0 = n0 >> 3;
    const v1 = n1 >> 3;
    const v2 = n2 >> 3;
    const r0 = (v0 << 3) | (v0 >> 2); // ooo12345 -> 12345ooo | ooooo123
    const r1 = (v1 << 3) | (v1 >> 2);
    const r2 = (v2 << 3) | (v2 >> 2);
    ctx.setError(0, n0 - r0);
    ctx.setError(1, n1 - r1);
    ctx.setError(2, n2 - r2);
    wdst[x] = v0 | (v1 << 5) | (v2 << 10);
    ctx.nextPixel();
  }
};
