import { FnRowOp } from "../FnRowOp";

/**
 * Алгоритм с заполнением нижней части чисел. Проецирует [0, 1F] => [0, FF]
 */
export const rgb15to24Quality: FnRowOp = (width, bsrc, dst) => {
  const wsrc = new Uint16Array(bsrc.buffer, bsrc.byteOffset);
  let srcPos = 0;
  let dstPos = 0;
  const srcEnd = srcPos + width;
  while (srcPos < srcEnd) {
    const a = wsrc[srcPos++]!;
    let c = a & 0x1f; // first
    dst[dstPos++] = (c >> 2) | (c << 3);
    c = (a >> 5) & 0x1f; // second component
    dst[dstPos++] = (c >> 2) | (c << 3);
    c = (a >> 10) & 0x1f; // third component
    dst[dstPos++] = (c >> 2) | (c << 3);
  }
};

// Чуть более быстрый, но менее качественный алгоритм. Проецирует [0, 1F] => [0, F8]
// То есть, нижняя часть числа остается незаполненная.
export const rgb15to24Fast: FnRowOp = (width, bsrc, dst) => {
  const wsrc = new Uint16Array(bsrc.buffer, bsrc.byteOffset);
  let srcPos = 0;
  let dstPos = 0;
  const srcEnd = srcPos + width;
  while (srcPos < srcEnd) {
    const a = wsrc[srcPos++]!;
    dst[dstPos++] = a << 3;
    dst[dstPos++] = (a >> 2) & 0xf8;
    dst[dstPos++] = (a >> 7) & 0xf8;
  }
};

// Используется для чтения 16-битовой палитры в Targa
export const rgb15to32Quality: FnRowOp = (width, bsrc, dst) => {
  const wsrc = new Uint16Array(bsrc.buffer, bsrc.byteOffset);
  let srcPos = 0;
  let dstPos = 0;
  const srcEnd = srcPos + width;
  while (srcPos < srcEnd) {
    const a = wsrc[srcPos++]!;
    let c = a & 0x1f; // first
    dst[dstPos++] = (c >> 2) | (c << 3);
    c = (a >> 5) & 0x1f; // second component
    dst[dstPos++] = (c >> 2) | (c << 3);
    c = (a >> 10) & 0x1f; // third component
    dst[dstPos++] = (c >> 2) | (c << 3);
    dst[dstPos++] = 0xff;
  }
};
