import { copyBytes } from "../../Converter/rowOps/copy/copyBytes";

/* eslint "no-param-reassign": "off" */

// Вообще есть два варианта:
// - считать всё сразу и распаковывать из буфера (возможно будет быстрее, но выделение лишней памяти)
// - читать в процессе распаковки (наверное медленнее, но экономия памяти).
// Здесь реализован первый вариант.

// В документации написано:
// Run-length Packets should never encode pixels from more than one scan line.
// Но в реальности встречаются файлы, где это не соблюдается.
// Данная реализация позволяет читать и такие.
// For example, ADESK2.TGA from the gallery.

export const rleUnpack = (
  width: number,
  src: Uint8Array,
  bytesPerPixel: number
) => {
  let srcPos = 0;
  let chunkLength = 0;
  let fillPos = 0;
  return (dst: Uint8Array) => {
    let leftWidth = width;
    let dstPos = 0;
    const fill = (count: number) => {
      for (let i = 0; i < count; i++) {
        for (let j = 0; j < bytesPerPixel; j++) {
          dst[dstPos++] = src[fillPos + j]!;
        }
      }
    };
    const literal = (count: number) => {
      const size = count * bytesPerPixel;
      copyBytes(size, src, srcPos, dst, dstPos);
      srcPos += size;
      dstPos += size;
    };
    if (chunkLength > 0) {
      const localLen = Math.min(leftWidth, chunkLength);
      leftWidth -= localLen;
      chunkLength -= localLen;
      if (fillPos) {
        fill(localLen);
      } else {
        literal(localLen);
      }
    }
    while (leftWidth > 0) {
      const a = src[srcPos++]!;
      let localLen = (a & 0x7f) + 1;
      if (a & 0x80) {
        // fill
        fillPos = srcPos;
        srcPos += bytesPerPixel;
        if (localLen > leftWidth) {
          chunkLength = localLen - leftWidth;
          localLen = leftWidth;
        }
        leftWidth -= localLen;
        fill(localLen);
      } else {
        // literal
        if (localLen > leftWidth) {
          chunkLength = localLen - leftWidth;
          fillPos = 0;
          localLen = leftWidth;
        }
        leftWidth -= localLen;
        literal(localLen);
      }
    }
  };
};
