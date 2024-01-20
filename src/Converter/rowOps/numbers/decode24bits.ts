import { isLittleEndian } from "../../../utils/isLittleEndian";
import { copyBytes } from "../copy/copyBytes";
import { FnNumberConversion } from "./FnNumberConversion";

export const swap24bits = (
  count: number,
  src: Uint8Array,
  srcOfs: number,
  dst: Uint8Array,
  dstOfs: number
) => {
  let srcPos = srcOfs;
  let dstPos = dstOfs;
  for (let i = 0; i < count; i++) {
    const c0 = src[srcPos++]!;
    const c1 = src[srcPos++]!;
    const c2 = src[srcPos++]!;
    dst[dstPos++] = c2;
    dst[dstPos++] = c1;
    dst[dstPos++] = c0;
  }
};

export const decode24bits: FnNumberConversion = (
  littleEndian,
  count,
  src,
  srcOfs,
  dst,
  dstOfs
) => {
  if (littleEndian !== isLittleEndian()) {
    swap24bits(count, src, srcOfs, dst, dstOfs);
  } else {
    copyBytes(count * 3, src, srcOfs, dst, dstOfs);
  }
};
