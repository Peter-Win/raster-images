import { FnRowOp } from "../FnRowOp";

// R16G16B16 -> R8G8B8 or B16G16R16 -> B8G8R8

export const rgb48to24Fast: FnRowOp = (width, bsrc, dst) => {
  const wsrc = new Uint16Array(bsrc.buffer, bsrc.byteOffset);
  let srcPos = 0;
  let dstPos = 0;
  const dstEnd = width * 3;
  while (dstPos < dstEnd) {
    dst[dstPos++] = wsrc[srcPos++]! >> 8;
    dst[dstPos++] = wsrc[srcPos++]! >> 8;
    dst[dstPos++] = wsrc[srcPos++]! >> 8;
  }
};

// TODO: Вариант с дизерингом пока не делал, т.к. "на глаз" всё равно не получится увидеть разницу в качестве
// т.к. при просмотре с экрана аппаратура всё равно занижает до 8 бит.
