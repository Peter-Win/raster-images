export const cvt8to16 = (
  count: number,
  src: Uint8Array,
  dst: Uint8Array
): void => {
  const wdst = new Uint16Array(dst.buffer, dst.byteOffset);
  let byte: number;
  for (let i = 0; i < count; i++) {
    byte = src[i]!;
    wdst[i] = (byte << 8) | byte;
  }
};
