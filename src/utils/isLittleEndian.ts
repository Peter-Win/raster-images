/**
 * Конечно, это немного странно. Но нет готовой функции, чтобы определить Endianness текущего процессора.
 * В официальной документации рекомендуется проверять порядок байтов
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView
 */

let littleEndian: boolean | undefined;

export const isLittleEndian = (): boolean => {
  if (littleEndian !== undefined) return littleEndian;
  const word = new Uint16Array([0xff00]);
  const bytes = new Uint8Array(word.buffer, word.byteOffset);
  // big endian:    FF 00
  // little endian: 00 FF
  littleEndian = !bytes[0];
  return littleEndian;
};
