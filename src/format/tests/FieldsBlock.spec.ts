import { BufferStream } from "../../stream";
import { ErrorRI, bytesToUtf8, dump } from "../../utils";
import {
  Field,
  FieldsBlock,
  fieldByte,
  fieldDword,
  fieldFourCC,
  fieldWord,
  getFieldOffset,
  readFieldsBlock,
  writeFieldsBlock,
} from "../FieldsBlock";

const enum Mode {
  first = 1,
  second = 2,
  third = 3,
}

interface TestHeader {
  fcc?: string;
  mode: Mode;
  word: number;
  dword: number;
}

const fields: Field<TestHeader>[] = [
  { ...fieldFourCC("fcc"), defaultValue: "DEFA" },
  { size: 3 }, // zero-filled reserved space
  {
    ...fieldByte("mode"),
    validate: (value) => {
      if (typeof value !== "number" || value < Mode.first || value > Mode.third)
        throw new ErrorRI("Invalid mode: <m>", { m: String(value) });
    },
  },
  fieldWord("word"),
  fieldDword("dword"),
];

describe("FieldsBlock", () => {
  it("little endian", async () => {
    const block: FieldsBlock<TestHeader> = {
      littleEndian: true,
      fields,
    };
    const buf = new Uint8Array(
      [
        [0x41, 0x42, 0x43, 0x44],
        [0, 0, 0],
        [Mode.third],
        [0x14, 3],
        [0x44, 0x33, 0x22, 0],
      ].flatMap((n) => n)
    );
    const rstream = new BufferStream(buf);
    const hd = await readFieldsBlock(rstream, block);
    expect(hd).toEqual({
      fcc: "ABCD",
      mode: Mode.third,
      word: 0x314,
      dword: 0x223344,
    });
    const dstBuf = new Uint8Array(100);
    const wstream = new BufferStream(dstBuf, { size: 0 });
    await writeFieldsBlock(hd, wstream, block);
    expect(await wstream.getSize()).toBe(buf.length);
    expect(dump(dstBuf.slice(0, buf.length))).toBe(
      "41 42 43 44 00 00 00 03 14 03 44 33 22 00"
    );
    expect(getFieldOffset("mode", block)).toBe(7);
  });

  it("big endian", async () => {
    const block: FieldsBlock<TestHeader> = {
      littleEndian: false,
      fields,
    };
    const buf = new Uint8Array(
      [
        [0x41, 0x42, 0x43, 0x44],
        [0, 0, 0],
        [Mode.third],
        [3, 0x14],
        [0, 0x22, 0x33, 0x44],
      ].flatMap((n) => n)
    );
    const rstream = new BufferStream(buf);
    const hd = await readFieldsBlock(rstream, block);
    expect(hd).toEqual({
      fcc: "ABCD",
      mode: Mode.third,
      word: 0x314,
      dword: 0x223344,
    });
    const dstBuf = new Uint8Array(100);
    const wstream = new BufferStream(dstBuf, { size: 0 });
    await writeFieldsBlock(hd, wstream, block);
    expect(await wstream.getSize()).toBe(buf.length);
    expect(dump(dstBuf.slice(0, buf.length))).toBe(
      "41 42 43 44 00 00 00 03 03 14 00 22 33 44"
    );
  });

  it("validate read", async () => {
    const block: FieldsBlock<TestHeader> = {
      littleEndian: true,
      fields,
    };
    const buf = new Uint8Array(
      [
        [0x41, 0x42, 0x43, 0x44],
        [0, 0, 0],
        [25],
        [0x14, 3],
        [0x44, 0x33, 0x22, 0],
      ].flatMap((n) => n)
    );
    const rstream = new BufferStream(buf);
    expect(async () => readFieldsBlock(rstream, block)).rejects.toThrowError(
      "Invalid mode: 25"
    );
  });

  it("validate write", async () => {
    const block: FieldsBlock<TestHeader> = {
      littleEndian: true,
      fields,
    };
    const hd: TestHeader = {
      fcc: "ABCD",
      mode: 25 as Mode,
      word: 0x314,
      dword: 0x223344,
    };
    const dstBuf = new Uint8Array(100);
    const wstream = new BufferStream(dstBuf, { size: 0 });
    expect(async () =>
      writeFieldsBlock(hd, wstream, block)
    ).rejects.toThrowError("Invalid mode: 25");
  });

  it("defaultValue", async () => {
    const block: FieldsBlock<TestHeader> = {
      littleEndian: true,
      fields,
    };
    const hd: TestHeader = {
      mode: Mode.first,
      word: 0x314,
      dword: 0x223344,
    };
    const dstBuf = new Uint8Array(100);
    const wstream = new BufferStream(dstBuf, { size: 0 });
    await writeFieldsBlock(hd, wstream, block);
    expect(bytesToUtf8(dstBuf.slice(0, 4))).toBe("DEFA");
  });
});
