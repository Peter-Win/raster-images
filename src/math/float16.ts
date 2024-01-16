/**
 * Half-precision floating-point format
 * @see https://en.wikipedia.org/wiki/Half-precision_floating-point_format
 * К сожалению, JavaScript пока поддерживает только Float32Array и Float64Array.
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
  const sign = f16 >> 15;
  const fraction = f16 & 0x3ff;
  const exp = (f16 & 0x7c00) >> 10;
  if (!exp) return neg14 * fraction;
  return (sign ? -1 : 1) * 2 ** (exp - 15) * (1 + fraction / 1024);
};

const neg14 = 2 ** -14 / 1024;
