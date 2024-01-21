import { FnNumberConversion } from "./FnNumberConversion";

// Можно использовать src === dst. Но при условии что dstOfs <= srcOfs
export const decodeWords: FnNumberConversion = (
  littleEndian,
  count,
  src,
  srcOfs,
  dst,
  dstOfs
) => {
  const dvSrc = new DataView(src.buffer, src.byteOffset + srcOfs);
  const wdst = new Uint16Array(dst.buffer, dst.byteOffset + dstOfs);
  let srcPos = 0;
  let dstIndex = 0;
  while (dstIndex < count) {
    wdst[dstIndex++] = dvSrc.getUint16(srcPos, littleEndian);
    srcPos += 2;
  }
};
