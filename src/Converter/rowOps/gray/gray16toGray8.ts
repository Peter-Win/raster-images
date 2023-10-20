import { FnRowOp } from "../FnRowOp";

export const gray16toGray8: FnRowOp = (
  width: number,
  src: Uint8Array,
  dst: Uint8Array
) => {
  const wsrc = new Uint16Array(src.buffer, src.byteOffset);
  let srcPos = 0;
  let dstPos = 0;
  const dstEnd = width;
  while (dstPos < dstEnd) {
    dst[dstPos++] = wsrc[srcPos++]! >> 8;
  }
};

export const grayAlpha16toGrayAlpha8: FnRowOp = (
  width: number,
  src: Uint8Array,
  dst: Uint8Array
) => gray16toGray8(width * 2, src, dst);
