// https://learn.microsoft.com/en-us/windows/win32/gdi/bitmap-compression

import { copyBytes } from "../../../cvt/copy/copyBytes";
import { FnRleUnpack, RleContext, Res } from "./rleTypes";

export const unpackRle8: FnRleUnpack = (
  srcData: Uint8Array,
  srcPos: number,
  dst: Uint8Array,
  ctx: RleContext
): number => {
  let { x } = ctx;
  let a = 0;
  let pos = srcPos;
  for (;;) {
    a = srcData[pos++]!;
    if (a) {
      // Encoded mode consists of two bytes: the first byte specifies the number of consecutive pixels
      // to be drawn using the color index contained in the second byte.
      const filler: number = srcData[pos++]!;
      dst.fill(filler, x, x + a);
      x += a;
    } else {
      a = srcData[pos++]!;
      if (a === Res.setPos) {
        ctx.x = srcData[pos++]!;
        ctx.y = srcData[pos++]!;
      } else {
        ctx.x = 0;
        ctx.y = 0;
      }
      if (a < Res.escCount) break;
      const len = (a + 1) & ~1;
      copyBytes(a, srcData, pos, dst, x);
      pos += len;
      x += a;
    }
  }
  ctx.res = a;
  return pos;
};
