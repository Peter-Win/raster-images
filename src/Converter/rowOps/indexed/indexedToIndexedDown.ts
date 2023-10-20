/**
 * Упаковка 8 бит в 4 бит.
 * предполагается, что исходные байты содержат значения в пределах от 0 до 15 !
 * @param count
 * @param src src.length = count
 * @param dst dst.length = (count+1) >> 1
 */
export const pack8to4bits = (
  count: number,
  src: Uint8Array,
  dst: Uint8Array
): void => {
  let byte = 0;
  let dstPos = 0;
  let srcPos = 0;
  while (srcPos < count) {
    const c = src[srcPos++]!;
    if ((srcPos & 1) === 1) {
      byte = c << 4;
    } else {
      byte |= c & 0xf;
      dst[dstPos++] = byte;
    }
  }
  if ((srcPos & 1) === 1) dst[dstPos] = byte;
};

/**
 * Предполагается, что исходная строка (8 bit/pixel) содержит лишь значения 0 и 1.
 */
export const pack8to1bit = (
  count: number,
  src: Uint8Array,
  dst: Uint8Array
): void => {
  let byte = 0;
  let dstPos = 0;
  let shift = 7;
  let srcPos = 0;
  while (srcPos < count) {
    const c = src[srcPos++]!;
    byte |= (c & 1) << shift;
    if (--shift < 0) {
      dst[dstPos++] = byte;
      byte = 0;
      shift = 7;
    }
  }
  if (shift !== 7) dst[dstPos] = byte;
};
