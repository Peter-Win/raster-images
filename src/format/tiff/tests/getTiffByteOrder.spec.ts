import { BufferStream } from "../../../stream";
import { getTiffByteOrder } from "../TiffFileHeader";

describe("getTiffByteOrder", () => {
  it("littleEndian", async () => {
    const st = new BufferStream(new Uint8Array([0x49, 0x49]));
    expect(await getTiffByteOrder(st)).toBe(true);
  });
  it("bigEndian", async () => {
    const st = new BufferStream(new Uint8Array([0x4d, 0x4d]));
    expect(await getTiffByteOrder(st)).toBe(false);
  });
  it("undefined", async () => {
    const st = new BufferStream(new Uint8Array([1, 2]));
    expect(await getTiffByteOrder(st)).toBeUndefined();
  });
});
