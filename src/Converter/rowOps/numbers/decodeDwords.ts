// Uint32
// Можно использовать src === dst. Но при условии что dstOfs <= srcOfs

export const decodeDwords = (
  littleEndian: boolean,
  count: number,
  src: Uint8Array,
  srcOfs: number,
  dst: Uint8Array,
  dstOfs: number
) => {
  const dvSrc = new DataView(src.buffer, src.byteOffset + srcOfs);
  const ddst = new Uint32Array(dst.buffer, dst.byteOffset + dstOfs);
  let srcPos = 0;
  let dstIndex = 0;
  while (dstIndex < count) {
    ddst[dstIndex++] = dvSrc.getUint32(srcPos, littleEndian);
    srcPos += 4;
  }
};
