export const copyBytes = (
  width: number,
  src: Uint8Array,
  srcOffset: number,
  dst: Uint8Array,
  dstOffset: number
) => {
  let dstPos = dstOffset;
  let srcPos = srcOffset;
  const lastPos = srcPos + width;
  while (srcPos < lastPos) {
    // eslint-disable-next-line no-param-reassign
    dst[dstPos++] = src[srcPos++]!;
  }
};
