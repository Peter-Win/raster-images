// https://learn.microsoft.com/en-us/windows/win32/gdi/bitmap-compression

import { FnRleUnpack, RleContext, Res } from "./rleTypes";

export const unpackRle4: FnRleUnpack = (
  srcData: Uint8Array,
  srcPos: number,
  dst: Uint8Array,
  ctx: RleContext
): number => {
  /* eslint "no-param-reassign": "off" */
  let { x } = ctx;
  let a = 0;
  let pos = srcPos;
  for (;;) {
    a = srcData[pos++]!;
    if (a) {
      // In encoded mode, the first byte of the pair contains the number of pixels to be drawn
      // using the color indexes in the second byte. The second byte contains two color indexes,
      // one in its high-order 4 bits and one in its low-order 4 bits. The first of the pixels
      // is drawn using the color specified by the high-order 4 bits, the second is drawn using
      // the color in the low-order 4 bits, the third is drawn using the color in the high-order 4 bits,
      // and so on, until all the pixels specified by the first byte have been drawn.
      let filler = srcData[pos++]!;
      let pix1 = filler >> 4;
      let pix2 = filler & 0x0f;
      for (let i = 0; i < a; i++) {
        const dstPos = x >> 1;
        if ((x & 1) === 0) dst[dstPos] = pix1 << 4;
        else dst[dstPos] |= pix1;
        x++;
        filler = pix1;
        pix1 = pix2;
        pix2 = filler;
      }
    } else {
      // In absolute mode, the first byte is zero. The second byte contains the number of color indexes
      // that follow. Subsequent bytes contain color indexes in their high- and low-order 4 bits,
      // one color index for each pixel. In absolute mode, each run must be aligned on a word boundary.
      // The end-of-line, end-of-bitmap, and delta escapes described for BI_RLE8 also apply to BI_RLE4 compression.
      a = srcData[pos++]!;

      if (a < Res.escCount) {
        ctx.res = a as Res;
        if (a === Res.setPos) {
          ctx.x = srcData[pos++]!;
          ctx.y = srcData[pos++]!;
        } else {
          ctx.x = 0;
          ctx.y = 0;
        }
        break;
      }
      let q = pos;
      for (let i = 0; i < a; i++) {
        const filler = (i & 1) === 0 ? srcData[q]! >> 4 : srcData[q++]! & 0x0f;

        const p = x >> 1;
        if ((x & 1) === 0) dst[p] = filler << 4;
        else dst[p] |= filler;
        x++;
      }
      const len = ((a + 1) / 2 + 1) & ~1;
      pos += len;
    }
  }
  return pos;
};
