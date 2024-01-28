/**
 * After some research, I found out that there has been a change in the implementation of the LZW compressor.
 * The original ("old-style") format used exactly the same mode of operation as the GIF LZW compressor.
 * Actually, you can use a working GIF compressor and snap it into a TIFF implementation without much effort,
 * and it will yield files that are accepted by most TIFF readers.
 * @see https://stackoverflow.com/questions/26366659/whats-special-about-tiff-5-0-style-lzw-compression
 */
import { PixelDepth } from "../../../types";

/* eslint no-param-reassign: "off" */

const bitsMin = 9;
const bitsMax = 12;
const ClearCode = 0x100;
const EoiCode = 0x101;
const TblStart = 0x102;

const makeMaxCode = (n: number) => (1 << n) - 1;

export class TiffUnpackerLzwOld {
  constructor(
    public readonly bitsPerPixel: PixelDepth,
    public readonly srcData: Uint8Array
  ) {
    this.maxCode = makeMaxCode(bitsMin);
    this.nextBits = 0;
    this.nextData = 0;
    this.init();
  }

  srcPos = 0;

  curString: number[] = [];

  strIndex = 0;

  nbits = 0;

  nbitsMask = 0;

  nextBits: number;

  nextData: number;

  maxCode: number;

  tables: number[][] = [];

  init() {
    this.nbits = bitsMin;
    this.nbitsMask = makeMaxCode(bitsMin);
    this.tables.length = 0;
    this.strIndex = 0;
  }

  unpackAll(dst: Uint8Array) {
    let dstPos = 0;
    let code: number;
    let oldCode = 0;
    while (dstPos < dst.length) {
      code = this.getNextCode();
      if (code === EoiCode) break;
      if (code === ClearCode) {
        do {
          this.nbits = bitsMin;
          this.nbitsMask = makeMaxCode(bitsMin);
          code = this.getNextCode();
        } while (code === ClearCode);
        if (code === EoiCode) break;
        if (code > ClearCode) {
          throw Error("Corrupted LZW table");
        }
        dst[dstPos++] = code;
        oldCode = code;
        continue;
      }
      // Add the new entry to the code table
      let newString: number[];
      if (oldCode < 256) {
        newString = [oldCode];
      } else {
        const oldCodeIndex = oldCode - TblStart;
        if (oldCodeIndex < this.tables.length) {
          newString = [...this.tables[oldCodeIndex]!];
        } else throw Error(`Invalid old code ${oldCode}`);
      }
      if (code < 256) {
        newString.push(code);
      } else {
        const strIndex = code - TblStart;
        if (strIndex === this.tables.length) {
          newString.push(newString[0]!);
        } else {
          if (strIndex < 0 || strIndex >= this.tables.length) {
            throw Error(`Invalid string index ${strIndex}`);
          }
          newString.push(this.tables[strIndex]![0]!);
        }
      }
      this.tables.push(newString);
      const tableTop = this.tables.length + TblStart;
      if (tableTop > this.nbitsMask && this.nbits < bitsMax) {
        this.nbits++;
        this.nbitsMask = makeMaxCode(this.nbits);
      }

      // export dst data
      if (code >= 256) {
        const str = this.tables[code - TblStart];
        if (!str) throw Error("Corrupted LZW table");
        for (let i = 0; i < str.length; i++) {
          dst[dstPos++] = str[i]!;
        }
      } else {
        dst[dstPos++] = code;
      }
      oldCode = code;
    }
  }

  getNextCode(): number {
    if (this.srcPos >= this.srcData.byteLength) {
      // Warning: Strip  not terminated with EOI code
      return EoiCode;
    }
    this.nextData |= this.srcData[this.srcPos++]! << this.nextBits;
    this.nextBits += 8;
    if (this.nextBits < this.nbits) {
      this.nextData |= this.srcData[this.srcPos++]! << this.nextBits;
      this.nextBits += 8;
    }
    const code = this.nextData & this.nbitsMask;
    this.nextData >>= this.nbits;
    this.nextBits -= this.nbits;
    return code;
  }
}
