export const cvt64to32 = (count: number, src: Uint8Array, dst: Uint8Array) => {
  const fsrc = new Float64Array(src.buffer, src.byteOffset);
  const fdst = new Float32Array(dst.buffer, dst.byteOffset);
  let srcPos = 0;
  let dstPos = 0;
  while (dstPos < count) {
    fdst[dstPos++] = fsrc[srcPos++]!;
  }
};
