import { MHIndex } from "./mhCodes";

export class BitFiller {
  bytePos = 0;

  bitPos = 0;

  /**
   * @param dstData MUST be zero filled
   */
  constructor(public dstData: Uint8Array) {}

  fill(color: MHIndex, length: number) {
    let { bitPos, bytePos } = this;
    if (bitPos + length <= 8) {
      // Изменения в пределах одного байта
      if (color) {
        const mask = (0xff >> (8 - length)) << (8 - bitPos - length);
        this.dstData[bytePos] |= mask;
        // } else {
        // Если считать, что dstData заполнено 0, то можно пропустить.
        // Это будет гораздо быстрее, чем выполнять битовую маску
      }
      bitPos += length;
      if (bitPos >= 8) {
        this.bitPos = bitPos - 8;
        this.bytePos++;
      } else {
        this.bitPos = bitPos;
      }
    } else {
      const leftBits = (8 - bitPos) & 7;
      const restBits = length - leftBits;
      const midBytes = restBits >> 3;
      const rightBits = restBits - (midBytes << 3);
      if (color) {
        if (leftBits) {
          this.dstData[bytePos] |= 0xff >> bitPos;
          bytePos++;
        }
        if (midBytes) {
          this.dstData.fill(0xff, bytePos, bytePos + midBytes);
          bytePos += midBytes;
        }
        if (rightBits) {
          this.dstData[bytePos] |= (0xff00 >> rightBits) & 0xff;
        }
      } else {
        bytePos += midBytes;
        if (leftBits) bytePos++;
      }
      this.bytePos = bytePos;
      this.bitPos = rightBits;
    }
  }

  seek(pos: number) {
    this.bytePos = pos;
    this.bitPos = 0;
  }
}
