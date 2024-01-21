export const decodeQwords = (
  littleEndian: boolean,
  count: number,
  src: Uint8Array,
  srcOfs: number,
  dst: Uint8Array,
  dstOfs: number
) => {
  const dvSrc = new DataView(src.buffer, src.byteOffset + srcOfs);
  const qdst = new Float64Array(dst.buffer, dst.byteOffset + dstOfs);
  let srcPos = 0;
  let dstIndex = 0;
  while (dstIndex < count) {
    qdst[dstIndex++] = dvSrc.getFloat64(srcPos, littleEndian);
    srcPos += 8;
  }
};
