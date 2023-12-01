export const cvt32to16 = (count: number, src: Uint8Array, dst: Uint8Array) => {
  const fa = new Float32Array(src.buffer, src.byteOffset);
  const wdst = new Uint16Array(dst.buffer, dst.byteOffset);
  let srcPos = 0;
  let dstPos = 0;
  while (dstPos < count) {
    wdst[dstPos++] = Math.max(Math.min(fa[srcPos++]! * 0xffff, 0xffff), 0);
  }
};
