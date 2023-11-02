import { copyBytes } from "../../Converter/rowOps/copy/copyBytes";

export const rlePack = (width: number, bytesPerPixel: number) => {
  // Для повышения производительности буфер выделяется один на все строки с двойным запасом
  const dstBuf = new Uint8Array(2 * bytesPerPixel * width);
  return (srcRow: Uint8Array) => {
    let p = 0;
    let x = 0;
    let x0 = 0;
    let dstPos = 0;
    let p0 = p;
    const cmpColor = (pos1: number, pos2: number): boolean => {
      let ofs = 0;
      while (ofs < bytesPerPixel && srcRow[pos1 + ofs] === srcRow[pos2 + ofs])
        ofs++;
      return ofs === bytesPerPixel;
    };
    while (x < width) {
      let i = 1;
      const colorPos = p;
      let q = p + bytesPerPixel;
      while (x + i < width && i < 128) {
        if (!cmpColor(q, colorPos)) break;
        i++;
        q += bytesPerPixel;
      }
      if (i > 1) {
        if (x0 < x) {
          const len = x - x0;
          dstBuf[dstPos++] = len - 1;
          copyBytes(len * bytesPerPixel, srcRow, p0, dstBuf, dstPos);
          dstPos += len * bytesPerPixel;
        }
        dstBuf[dstPos++] = (i - 1) | 0x80;
        copyBytes(bytesPerPixel, srcRow, colorPos, dstBuf, dstPos);
        dstPos += bytesPerPixel;
        p = q;
        p0 = q;
        x += i;
        x0 = x;
      } else {
        x += i;
        p = q;
      }
      if (x - x0 >= 128) {
        dstBuf[dstPos++] = 127;
        copyBytes(128 * bytesPerPixel, srcRow, p0, dstBuf, dstPos);
        dstPos += 128 * bytesPerPixel;
        p0 += 128 * bytesPerPixel;
        p = p0;
        x = x0 + 128;
        x0 = x;
      }
    }
    if (x0 < x) {
      const len = x - x0;
      dstBuf[dstPos++] = len - 1;
      copyBytes(len * bytesPerPixel, srcRow, p0, dstBuf, dstPos);
      dstPos += len * bytesPerPixel;
    }

    return new Uint8Array(dstBuf.buffer, dstBuf.byteOffset, dstPos);
  };
};
