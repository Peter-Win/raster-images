import { FnNumberConversion } from "./FnNumberConversion";

// Можно использовать src === dst. Но при условии что dstOfs <= srcOfs
export const encodeWords: FnNumberConversion = (
  littleEndian,
  count,
  src,
  srcOfs,
  dst,
  dstOfs
) => {
  const dvDst = new DataView(dst.buffer, dst.byteOffset + dstOfs);
  const wsrc = new Uint16Array(src.buffer, src.byteOffset + srcOfs);
  let dstPos = 0;
  let srcIndex = 0;
  while (srcIndex < count) {
    // wdst[dstIndex++] = dvSrc.getUint16(srcPos, littleEndian);
    dvDst.setUint16(dstPos, wsrc[srcIndex++]!, littleEndian);
    dstPos += 2;
  }
};
