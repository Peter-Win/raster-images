import { BufferStream } from "../BufferStream";
import {
  readByte,
  readWordLE,
  readWordBE,
  readDwordLE,
  readDwordBE,
  readInt16LE,
  readInt16BE,
  readDwordArray,
} from "../readNumber";

describe("readNumber", () => {
  it("readByte", async () => {
    const stream = new BufferStream(new Uint8Array([2, 0x55, 0xff]));
    expect(await readByte(stream)).toBe(2);
    expect(await readByte(stream)).toBe(0x55);
    expect(await readByte(stream)).toBe(0xff);
  });

  it("readWordLE", async () => {
    const stream = new BufferStream(new Uint8Array([1, 2, 3, 4, 0x55, 0xaa]));
    expect(await readWordLE(stream)).toBe(0x201);
    expect(await readWordLE(stream)).toBe(0x403);
    expect(await readWordLE(stream)).toBe(0xaa55);
  });

  it("readWordBE", async () => {
    const stream = new BufferStream(new Uint8Array([1, 2, 3, 4, 0x55, 0xaa]));
    expect(await readWordBE(stream)).toBe(0x102);
    expect(await readWordBE(stream)).toBe(0x304);
    expect(await readWordBE(stream)).toBe(0x55aa);
  });

  it("readDwordLE", async () => {
    const stream = new BufferStream(
      new Uint8Array([1, 2, 3, 4, 0x33, 0x55, 0xaa, 0x77])
    );
    expect(await readDwordLE(stream)).toBe(0x4030201);
    expect(await readDwordLE(stream)).toBe(0x77aa5533);
  });

  it("readDwordBE", async () => {
    const stream = new BufferStream(
      new Uint8Array([1, 2, 3, 4, 0x33, 0x55, 0xaa, 0xee])
    );
    expect(await readDwordBE(stream)).toBe(0x1020304);
    expect(await readDwordBE(stream)).toBe(0x3355aaee);
  });

  it("readInt16LE", async () => {
    const stream = new BufferStream(new Uint8Array([0xfe, 0xff, 2, 0]));
    expect(await readInt16LE(stream)).toBe(-2);
    expect(await readInt16LE(stream)).toBe(2);
  });

  it("readInt16BE", async () => {
    const stream = new BufferStream(new Uint8Array([0xff, 0xfe, 0, 2]));
    expect(await readInt16BE(stream)).toBe(-2);
    expect(await readInt16BE(stream)).toBe(2);
  });
});

describe("readDwordArray", () => {
  it("big endian", async () => {
    const bbuf = new Uint8Array(
      [
        [0, 0, 0, 0],
        [0, 0, 0, 1],
        [0, 0, 1, 0],
        [0xfe, 0xdc, 0xba, 0x98],
      ].flatMap((n) => n)
    );
    const stream = new BufferStream(bbuf);
    const res = await readDwordArray(stream, bbuf.length / 4, false);
    expect(res).toEqual([0, 1, 0x100, 0xfedcba98]);
  });
});
