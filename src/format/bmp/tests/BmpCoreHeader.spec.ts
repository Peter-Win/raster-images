import {
  BmpCoreHeader,
  readBmpCoreHeader,
  bmpCoreHeaderSize,
  writeBmpCoreHeader,
} from "../BmpCoreHeader";

const example: number[] = [0x0c, 0, 0, 0, 0x78, 0, 0x66, 0, 1, 0, 8, 0];

test("readBmpCoreHeader", () => {
  const buf = new Uint8Array(example);
  const hd = readBmpCoreHeader(buf.buffer, buf.byteOffset);
  expect(hd).toEqual({
    bcSize: 12,
    bcWidth: 120,
    bcHeight: 102,
    bcPlanes: 1,
    bcBitCount: 8,
  } as BmpCoreHeader);
});

test("writeBmpCoreHeader", () => {
  const hd: BmpCoreHeader = {
    bcSize: 12,
    bcWidth: 120,
    bcHeight: 102,
    bcPlanes: 1,
    bcBitCount: 8,
  };
  const buf = new Uint8Array(bmpCoreHeaderSize);
  writeBmpCoreHeader(hd, buf.buffer, buf.byteOffset);
  expect(Array.from(buf)).toEqual(example);
});
