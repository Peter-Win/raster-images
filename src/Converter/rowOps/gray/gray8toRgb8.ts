export const gray8toRgb8 = (
  width: number,
  src: Uint8Array,
  dst: Uint8Array
): void => {
  let srcPos = 0;
  let dstPos = 0;
  while (srcPos < width) {
    const g = src[srcPos++]!;
    dst[dstPos++] = g;
    dst[dstPos++] = g;
    dst[dstPos++] = g;
  }
};

export const gray8toRgba8 = (
  width: number,
  src: Uint8Array,
  dst: Uint8Array
): void => {
  let srcPos = 0;
  let dstPos = 0;
  while (srcPos < width) {
    const g = src[srcPos++]!;
    dst[dstPos++] = g;
    dst[dstPos++] = g;
    dst[dstPos++] = g;
    dst[dstPos++] = 0xff;
  }
};

export const grayAlpha8toRgba8 = (
  width: number,
  src: Uint8Array,
  dst: Uint8Array
) => {
  let srcPos = 0;
  let dstPos = 0;
  const dstEnd = width * 4;
  while (dstPos < dstEnd) {
    const g = src[srcPos++]!;
    dst[dstPos++] = g;
    dst[dstPos++] = g;
    dst[dstPos++] = g;
    dst[dstPos++] = src[srcPos++]!;
  }
};
