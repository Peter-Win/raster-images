import { FnRowOp } from "../FnRowOp";

/**
 * Алгоритм с заполнением нижней части чисел. Проецирует [0, 1F] => [0, FF]
 */
export const rgb16to24Quality: FnRowOp = (width, bsrc, dst) => {
  const wsrc = new Uint16Array(bsrc.buffer, bsrc.byteOffset);
  let srcPos = 0;
  let dstPos = 0;
  const srcEnd = srcPos + width;
  while (srcPos < srcEnd) {
    const a = wsrc[srcPos++]!;
    let c = a & 0x1f; // first
    dst[dstPos++] = (c >> 2) | (c << 3); // 0001.1111, 1111.1000 << 3, 0000.0111 >> 2
    c = (a >> 5) & 0x3f; // second component
    dst[dstPos++] = (c >> 4) | (c << 2); // 0011.1111, 1111.1100 << 2, 0000.0011 >> 4
    c = (a >> 11) & 0x1f; // third component
    dst[dstPos++] = (c >> 2) | (c << 3);
  }
};

// Чуть более быстрый, но менее качественный алгоритм. Проецирует [0, 1F] => [0, F8]
// То есть, нижняя часть числа остается незаполненная.
export const rgb16to24Fast: FnRowOp = (width, bsrc, dst) => {
  const wsrc = new Uint16Array(bsrc.buffer, bsrc.byteOffset);
  let srcPos = 0;
  let dstPos = 0;
  const srcEnd = srcPos + width;
  while (srcPos < srcEnd) {
    const a = wsrc[srcPos++]!;
    dst[dstPos++] = a << 3; // 0000.0000.0001.1111 << 3 = 0000.0000.1111.1000
    dst[dstPos++] = (a >> 3) & 0xfc; // 0000.0111.1110.0000 >> 3 = 1111.1100
    dst[dstPos++] = (a >> 8) & 0xf8; // 1111.1000.0000.0000 >> 8 = 1111.1000
  }
};

// Используется для чтения 16-битовой палитры в Targa
export const rgb16to32Quality: FnRowOp = (width, bsrc, dst) => {
  const wsrc = new Uint16Array(bsrc.buffer, bsrc.byteOffset);
  let srcPos = 0;
  let dstPos = 0;
  const srcEnd = srcPos + width;
  while (srcPos < srcEnd) {
    const a = wsrc[srcPos++]!;
    let c = a & 0x1f; // first
    dst[dstPos++] = (c >> 2) | (c << 3);
    c = (a >> 5) & 0x3f; // second component
    dst[dstPos++] = (c >> 4) | (c << 2);
    c = (a >> 11) & 0x1f; // third component
    dst[dstPos++] = (c >> 2) | (c << 3);
    dst[dstPos++] = 0xff;
  }
};
