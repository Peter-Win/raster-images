import { BufferStream } from "../BufferStream";
import {
  readByte,
  readWordLE,
  readWordBE,
  readDwordLE,
  readDwordBE,
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
});
