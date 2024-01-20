import { FnRowOp } from "../FnRowOp";

const L = 0xffff;
const Lneg = 1 / L;

export const cmyk16toRgb16: FnRowOp = (width, src, dst) => {
  const wsrc = new Uint16Array(src.buffer, src.byteOffset);
  const wdst = new Uint16Array(dst.buffer, dst.byteOffset);
  let srcPos = 0;
  const srcEnd = width * 4;
  let dstPos = 0;
  while (srcPos < srcEnd) {
    const c = 1 - wsrc[srcPos++]! * Lneg;
    const m = 1 - wsrc[srcPos++]! * Lneg;
    const y = 1 - wsrc[srcPos++]! * Lneg;
    const k = 1 - wsrc[srcPos++]! * Lneg;
    const kL = k * L;
    // red =   L × (1-C) × (1-K)
    wdst[dstPos++] = Math.max(Math.min(c * kL, L), 0);
    // green = L × (1-M) × (1-K)
    wdst[dstPos++] = Math.max(Math.min(m * kL, L), 0);
    // blue =  L × (1-Y) × (1-K)
    wdst[dstPos++] = Math.max(Math.min(y * kL, L), 0);
  }
};

export const cmyka16toRgba16: FnRowOp = (width, src, dst) => {
  // Кроме альфы, аналогично cmyk16toRgb16
  const wsrc = new Uint16Array(src.buffer, src.byteOffset);
  const wdst = new Uint16Array(dst.buffer, dst.byteOffset);
  let srcPos = 0;
  const srcEnd = width * 5;
  let dstPos = 0;
  while (srcPos < srcEnd) {
    const c = 1 - wsrc[srcPos++]! * Lneg;
    const m = 1 - wsrc[srcPos++]! * Lneg;
    const y = 1 - wsrc[srcPos++]! * Lneg;
    const k = 1 - wsrc[srcPos++]! * Lneg;
    const kL = k * L;
    const a = wsrc[srcPos++]!;
    wdst[dstPos++] = Math.max(Math.min(c * kL, L), 0);
    wdst[dstPos++] = Math.max(Math.min(m * kL, L), 0);
    wdst[dstPos++] = Math.max(Math.min(y * kL, L), 0);
    // alpha
    wdst[dstPos++] = a;
  }
};
