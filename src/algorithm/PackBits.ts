/**
 * https://en.wikipedia.org/wiki/PackBits
 * PackBits is a fast, simple lossless compression scheme for run-length encoding of data.
 */

import { copyBytes } from "../Converter/rowOps/copy/copyBytes";

export const unpackBits = (
  dst: Uint8Array,
  src: Uint8Array,
  srcLength?: number
): number => {
  const length = srcLength ?? src.length;
  let dstPos = 0;
  let srcPos = 0;
  let code: number;
  while (srcPos < length) {
    code = src[srcPos++]!;
    if (code >= 128) {
      // This is a repeated byte
      const len = 257 - code;
      code = src[srcPos++]!;
      dst.fill(code, dstPos, dstPos + len);
      dstPos += len;
    } else {
      // literal
      code++;
      copyBytes(code, src, srcPos, dst, dstPos);
      dstPos += code;
      srcPos += code;
    }
  }
  return srcPos;
};
