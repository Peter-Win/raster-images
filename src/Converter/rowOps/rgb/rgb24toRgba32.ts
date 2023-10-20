export const rgb24toRgba32 = (
  width: number,
  src: Uint8Array,
  dst: Uint8Array
): void => {
  let srcPos = 0;
  let dstPos = 0;
  const dstEnd = width * 4;
  while (dstPos < dstEnd) {
    dst[dstPos++] = src[srcPos++]!;
    dst[dstPos++] = src[srcPos++]!;
    dst[dstPos++] = src[srcPos++]!;
    dst[dstPos++] = 0xff;
  }
};

export const rgb24toRgba32AndSwapRB = (
  width: number,
  src: Uint8Array,
  dst: Uint8Array
): void => {
  let srcPos = 0;
  let dstPos = 0;
  const dstEnd = width * 4;
  while (dstPos < dstEnd) {
    const c0 = src[srcPos++]!;
    const c1 = src[srcPos++]!;
    const c2 = src[srcPos++]!;
    dst[dstPos++] = c2;
    dst[dstPos++] = c1;
    dst[dstPos++] = c0;
    dst[dstPos++] = 0xff;
  }
};
