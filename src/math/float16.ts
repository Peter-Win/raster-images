import { isLittleEndian } from "../utils/isLittleEndian";

/**
 * Half-precision floating-point format
 * @see https://en.wikipedia.org/wiki/Half-precision_floating-point_format
 * JavaScript поддерживает только Float32Array и Float64Array. В других языках также нет поддержки Float16.
 * Но в растровых форматах (TIFF) данные могут быть представлены в виде Float16.
 * Поэтому обработка таких данных выполняется программно.
 * Конечно, это очень медленно.
 * Но главное, что такие данные читаются.
 * 8000     03FF
 * v     <---10--->
 * SEEEEEFFFFFFFFFF
 *  <-5->
 *   7C00
 */
export const getFloat16 = (f16: number): number => {
  const fraction = f16 & 0x3ff;
  const exp = (f16 & 0x7c00) >> 10;
  if (!exp) return neg14 * fraction;
  const sign = f16 >> 15;
  return (sign ? -1 : 1) * 2 ** (exp - 15) * (1 + fraction / 1024);
};

const neg14 = 2 ** -14 / 1024;

export const copyFloat16to32 = (
  count: number,
  srcFP16: Uint8Array,
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
    // Little endian 1.0 = 0x3c00 = 00 3C
    while (dstPos < count) {
      const fp16 = srcFP16[srcPos++]! | (srcFP16[srcPos++]! << 8);
      fdst[dstPos++] = getFloat16(fp16);
    }
  } else {
    // Big endian 1.0 = 3C 00
    while (dstPos < count) {
      const fp16 = (srcFP16[srcPos++]! << 8) | srcFP16[srcPos++]!;
      fdst[dstPos++] = getFloat16(fp16);
    }
  }
};
