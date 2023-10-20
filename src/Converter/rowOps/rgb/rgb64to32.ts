// R16G16B16A16 -> R8G8B8A8 or B16G16R16A16 -> B8G8R8A8

import { FnRowOp } from "../FnRowOp";

export const rgb64to32Fast: FnRowOp = (width, bsrc, dst) => {
  const wsrc = new Uint16Array(bsrc.buffer, bsrc.byteOffset);
  let srcPos = 0;
  let dstPos = 0;
  const dstEnd = width * 4;
  while (dstPos < dstEnd) {
    dst[dstPos++] = wsrc[srcPos++]! >> 8;
    dst[dstPos++] = wsrc[srcPos++]! >> 8;
    dst[dstPos++] = wsrc[srcPos++]! >> 8;
    dst[dstPos++] = wsrc[srcPos++]! >> 8;
  }
};
