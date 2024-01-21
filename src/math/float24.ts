/**
 * TIFF формат поддерживает тип данных floating point 24 bit.
 * В JavaScript (и в других языках) такой тип данных не поддерживается.
 * К сожалению, в описании стандарта IEEE 754 такой формат отсутствует.
 * @see https://en.wikipedia.org/wiki/IEEE_754
 * Поэтому пришлось подбирать коэффициенты, чтобы читались файлы, сохранённые в PhotoShop
 */

import { isLittleEndian } from "../utils/isLittleEndian";

export const getFloat24 = (value: number): number => {
  const exp = (value >> 16) & 0x7f;
  const mantis = value & 0xffff;
  if (!exp) return negK * mantis;
  const s = value >> 23;
  return (s ? -1 : 1) * 2 ** (exp - 0x3f) * (1 + mantis / 0x10000);
};
const negK = 2 ** -16 / 0x10000;

export const copyFloat24to32 = (
  count: number,
  srcFP24: Uint8Array,
  srcStart: number,
  dstFP32: Uint8Array | Float32Array,
  littleEndian?: boolean
) => {
  const finalLittleEndian = littleEndian ?? isLittleEndian();
  const fdst: Float32Array =
    dstFP32 instanceof Float32Array
      ? dstFP32
      : new Float32Array(dstFP32.buffer, dstFP32.byteOffset);
  let srcPos = srcStart;
  let dstPos = 0;
  if (finalLittleEndian) {
    // Little endian 1.0 = 00 00 3F
    while (dstPos < count) {
      let fp24 = srcFP24[srcPos++]!;
      fp24 |= srcFP24[srcPos++]! << 8;
      fp24 |= srcFP24[srcPos++]! << 16;
      fdst[dstPos++] = getFloat24(fp24);
    }
  } else {
    // Big endian 1.0 = 3F 00 00
    while (dstPos < count) {
      let fp24 = srcFP24[srcPos++]! << 16;
      fp24 |= srcFP24[srcPos++]! << 8;
      fp24 |= srcFP24[srcPos++]!;
      fdst[dstPos++] = getFloat24(fp24);
    }
  }
};
