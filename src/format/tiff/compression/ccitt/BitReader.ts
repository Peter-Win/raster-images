import { TiffFillOrder } from "../../tags/TiffFillOrder";

export class BitReader {
  protected pos = 0;

  protected shift: number;

  constructor(
    public readonly data: Uint8Array,
    public readonly fillOrder: TiffFillOrder
  ) {
    this.shift = fillOrder === TiffFillOrder.lowColInLowBit ? 0 : 7;
  }

  getStrBit(): "0" | "1" {
    if (this.fillOrder === TiffFillOrder.lowColInLowBit) {
      const res = (this.data[this.pos]! >>> this.shift) & 1 ? "1" : "0";
      if (++this.shift === 8) {
        this.shift = 0;
        this.pos++;
      }
      return res;
    }
    const res = (this.data[this.pos]! >>> this.shift) & 1 ? "1" : "0";
    if (--this.shift < 0) {
      this.shift = 7;
      this.pos++;
    }
    return res;
  }

  alignToByte() {
    if (this.fillOrder === TiffFillOrder.lowColInLowBit) {
      if (this.shift !== 0) {
        this.shift = 0;
        this.pos++;
      }
    } else if (this.shift !== 7) {
      this.shift = 7;
      this.pos++;
    }
  }

  isEnd() {
    return this.pos >= this.data.length;
  }
}
