import { PixelDepth } from "../../../types";
import { calcPitch } from "../../../ImageInfo/calcPitch";

const ClearCode = 0x100;
const EoiCode = 0x101;
const TblStart = 0x102;

type LzwString = number[];

export class TiffUnpackerLzw {
  table: LzwString[] = [];

  startBit: number = 0;

  codeSize: number = 0;

  tblTop: number = 0;

  curW: number = 0;

  mask: number = 0;

  oldCode: number = 0;

  curStr: number = 0;

  strIndex: number = 0;

  srcPos: number = 0;

  constructor(
    public readonly bitsPerPixel: PixelDepth,
    public readonly srcData: Uint8Array
  ) {
    this.onStart();
  }

  onStart() {
    this.initTable();
    this.startBit = 0;
  }

  onStop() {
    this.table.length = 0;
  }

  /* eslint no-param-reassign: "off" */

  unpackRow(dst: Uint8Array, pixCount: number) {
    const byteLen = calcPitch(pixCount, this.bitsPerPixel);
    let pdst = 0;
    while (pdst < byteLen) {
      dst[pdst++] = this.getNextByte();
    }
  }

  unpackAll(dst: Uint8Array) {
    const { length } = this.srcData;
    let dstPos = 0;
    while (this.srcPos < length || this.strIndex > 0) {
      const b = this.getNextByte();
      dst[dstPos++] = b;
    }
  }

  initTable() {
    this.codeSize = 9;
    this.mask = 511;
    this.table.length = 0;
    this.strIndex = 0;
    this.tblTop = TblStart;
  }

  protected readWord(): void {
    const a = this.srcData[this.srcPos++]!;
    const b = this.srcData[this.srcPos++]!;
    this.curW = b | (a << 8);
  }

  getNextCode(): number {
    if (this.startBit === 0) {
      this.readWord();
    }
    let shift = 16 - this.startBit - this.codeSize;
    let v: number;
    if (shift >= 0) {
      v = this.curW >>> shift;
      this.startBit += this.codeSize;
    } else {
      shift = -shift;
      v = this.curW << shift;
      this.readWord();
      this.startBit = shift;
      v |= this.curW >>> (16 - shift);
    }
    return v & this.mask;
  }

  addStrToTbl(s: LzwString) {
    this.table.push(s);
    this.tblTop++;
    if (this.tblTop === this.mask) {
      this.codeSize++;
      this.mask = (this.mask << 1) | 1;
    }
  }

  getNextByte(): number {
    let b: number;
    if (this.strIndex > 0) {
      const s: LzwString = this.table[this.curStr]!;
      b = s[this.strIndex++]!;
      if (this.strIndex === s.length) {
        this.strIndex = 0;
      }
      return b;
    }
    let code: number = this.getNextCode();
    if (code === EoiCode) {
      // end of image
      return 0;
    }
    if (code === ClearCode) {
      this.initTable();
      code = this.getNextCode();
      if (code === EoiCode) {
        return 0;
      }
      if (code >= TblStart) {
        throw Error("LZW data corrupted");
      }
      b = code;
    } else if (code < this.tblTop) {
      if (code < 256) b = code;
      else {
        this.curStr = code - TblStart;
        this.strIndex = 1;
        b = this.table[this.curStr]![0]!;
      }
      let s: LzwString;
      if (this.oldCode < 256) {
        s = [this.oldCode];
      } else {
        s = [...this.table[this.oldCode - TblStart]!];
      }
      if (code < 256) {
        s.push(code);
      } else {
        s.push(this.table[code - TblStart]![0]!);
      }
      this.addStrToTbl(s);
    } else {
      if (code > this.tblTop) {
        throw Error("LZW data corrupted");
      }
      let s: LzwString;
      if (this.oldCode < 256) {
        s = [this.oldCode];
      } else {
        s = [...this.table[this.oldCode - TblStart]!];
      }
      s.push(s[0]!);
      b = s[0]!;
      this.strIndex = 1;
      this.curStr = this.tblTop - TblStart;
      this.addStrToTbl(s);
    }
    this.oldCode = code;
    return b;
  }
}
