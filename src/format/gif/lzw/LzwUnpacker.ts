import { RAStream, readByte } from "../../../stream";
import { calcGifTableSize } from "../calcGifTableSize";

type TableString = number[];

export class LzwUnpacker {
  buf: Uint8Array = new Uint8Array();

  bufPos: number = 0;

  curCodeSize: number;

  bFinish: boolean = false;

  bitOffs: number = 0;

  prevCode: number = 0;

  table: TableString[] = [];

  tableStart: number;

  strIndex: number = 0;

  curStr: number = 0;

  constructor(public stream: RAStream, public startCodeSize: number) {
    this.curCodeSize = startCodeSize;
    this.tableStart = (1 << startCodeSize) + 2;
  }

  async readLine(line: Uint8Array, width: number) {
    let pos = 0;
    while (!this.bFinish && pos < width) {
      // eslint-disable-next-line  no-param-reassign
      line[pos++] = await this.getNextByte();
    }
  }

  async getNextByte(): Promise<number> {
    let b: number;
    if (this.strIndex > 0) {
      // reading seria from table
      const s: TableString = this.table[this.curStr]!;
      b = s[this.strIndex++]!;
      if (this.strIndex === s.length) {
        this.strIndex = 0;
      }
      return b;
    }
    const nColors = 1 << this.startCodeSize;
    const clearCode = 1 << this.startCodeSize;
    const eoiCode = clearCode + 1;
    const { tableStart } = this;
    const tableEnd = this.tableStart + this.table.length;
    let code = await this.readCode();
    if (code === eoiCode) {
      // end of image
      return 0;
    }
    if (code === clearCode) {
      this.initTable();
      code = await this.readCode();
      if (code === eoiCode) {
        return 0;
      }
      if (code >= tableStart) {
        this.onCorrupted();
        return 0;
      }
      b = code & 0xff;
    } else if (code < tableEnd) {
      if (code < nColors) b = code & 0xff;
      else {
        this.curStr = code - tableStart;
        this.strIndex = 1;
        b = this.table[this.curStr]![0]!;
      }
      let s;
      if (this.prevCode < nColors) {
        s = [this.prevCode];
      } else {
        s = this.table[this.prevCode - tableStart]!;
      }
      if (code < nColors) {
        s.push(code);
      } else {
        s.push(this.table[code - tableStart]![0]!);
      }
      this.addStrToTbl(s);
    } else {
      if (code > tableEnd) {
        this.onCorrupted();
        return 0;
      }
      // Duplicate prevCode
      let s: TableString;
      if (this.prevCode < nColors) {
        s = [this.prevCode];
      } else {
        s = this.table[this.prevCode - tableStart]!;
      }
      s.push(s[0]!);
      b = s[0]!;
      this.strIndex = 1;
      this.curStr = this.table.length;
      this.addStrToTbl(s);
    }
    this.prevCode = code;
    return b;
  }

  protected onCorrupted() {
    this.bFinish = true;
  }

  protected initTable() {
    this.curCodeSize = this.startCodeSize;
    this.table.length = 0;
    this.strIndex = 0;
  }

  protected async readCode(): Promise<number> {
    if (this.bFinish) {
      return 0;
    }
    const codeSize = this.curCodeSize + 1;
    let code = 0;
    const end = this.bitOffs + codeSize;
    const nBytes = (end + 7) >> 3;

    for (let i = 0; i < nBytes; i++) {
      if (!(await this.checkBuffer())) return 0;
      const c1 = this.buf[this.bufPos++]!;
      code |= c1 << (i << 3);
    }

    code >>= this.bitOffs;
    code &= (1 << codeSize) - 1;

    this.bitOffs = end & 7;
    if (this.bitOffs !== 0) this.bufPos--;

    return code;
  }

  protected addStrToTbl(s: TableString) {
    this.table.push(s);
    const te = this.table.length + this.tableStart;
    if (te === calcGifTableSize(this.curCodeSize)) {
      this.curCodeSize++;
    }
  }

  protected async checkBuffer(): Promise<boolean> {
    if (this.bufPos < this.buf.length) {
      return true;
    }
    // read next GIF block
    const bufSize = await readByte(this.stream);
    if (bufSize === 0) {
      this.bFinish = true;
      return false;
    }
    this.buf = await this.stream.read(bufSize);
    this.bufPos = 0;

    return true;
  }
}
