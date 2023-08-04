import { RAStream, readByte, isEndOfStream } from "../../stream";

const whitespace = new Set<number>(
  Array.from(" \t\r\n").map((c) => c.charCodeAt(0))
);

export class PnmReader {
  constructor(public stream: RAStream) {}

  async skipSpaces(): Promise<void> {
    while (!(await isEndOfStream(this.stream))) {
      const b: number = await readByte(this.stream);
      if (!whitespace.has(b)) {
        await this.stream.skip(-1);
        break;
      }
    }
  }

  async skipComment(): Promise<void> {
    while (!(await isEndOfStream(this.stream))) {
      const b: number = await readByte(this.stream);
      const c: string = String.fromCharCode(b);
      if (c === "\n" || c === "\r") {
        break;
      }
    }
  }

  async readString(): Promise<string> {
    await this.skipSpaces();
    let result: string = "";
    while (!(await isEndOfStream(this.stream))) {
      const b: number = await readByte(this.stream);
      if (whitespace.has(b)) {
        // этот символ больше не нужен
        break;
      }
      const char = String.fromCharCode(b);
      if (char === "#") {
        await this.skipComment();
        await this.skipSpaces();
      } else {
        result += char;
      }
    }
    return result;
  }
}
