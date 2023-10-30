import { dumpChunks, subBuffer } from "../../../../utils";
import { rgb16to24Quality, rgb16to24Fast, rgb16to32Quality } from "../rgb16";

// max value = 31, g5=63
const pk = (r5: number, g6: number, b5: number): number =>
  b5 | (g6 << 5) | (r5 << 11);

const srcRow: number[] = [
  pk(0xb, 0xa, 0xd), // 0 - don't cvt
  pk(1, 1, 1), // 1
  pk(31, 63, 31), // 2
  pk(31, 0, 0), // 3
  pk(0, 63, 0), // 4
  pk(0, 0, 31), // 5
  pk(1, 2, 3), // 6
  pk(4, 5, 6), // 7
  pk(7, 8, 9), // 8
  pk(15, 16, 30), // 9
  pk(0xf, 0x00, 0xd), // 10 - don't cvt
];

const startPos = 1;
const endPos = 10;
const cvtLength = endPos - startPos;

test("rgb16to24Quality", () => {
  const src = new Uint16Array(srcRow);
  const dst = new Uint8Array(3 * srcRow.length);
  rgb16to24Quality(
    cvtLength,
    new Uint8Array(src.buffer, src.byteOffset + 2 * startPos),
    subBuffer(dst, 3 * startPos)
  );
  const b3 = dumpChunks(3, dst);
  expect(b3).toEqual([
    "00 00 00", // not changed
    "08 04 08",
    "FF FF FF",
    "00 00 FF",
    "00 FF 00",
    "FF 00 00",
    "18 08 08",
    "31 14 21",
    "4A 20 39",
    "F7 41 7B",
    "00 00 00", // not changed
  ]);
});

test("rgb16to24Fast", () => {
  const src = new Uint16Array(srcRow);
  const dst = new Uint8Array(3 * srcRow.length);
  rgb16to24Fast(
    cvtLength,
    new Uint8Array(src.buffer, src.byteOffset + 2 * startPos),
    subBuffer(dst, 3 * startPos)
  );
  const b3 = dumpChunks(3, dst);
  expect(b3).toEqual([
    "00 00 00",
    "08 04 08",
    "F8 FC F8",
    "00 00 F8",
    "00 FC 00",
    "F8 00 00",
    "18 08 08",
    "30 14 20",
    "48 20 38",
    "F0 40 78",
    "00 00 00",
  ]);
});

test("rgb16to32Quality", () => {
  const src = new Uint16Array(srcRow);
  const dst = new Uint8Array(4 * srcRow.length);
  rgb16to32Quality(
    cvtLength,
    new Uint8Array(src.buffer, src.byteOffset + 2 * startPos),
    subBuffer(dst, 4 * startPos)
  );
  const b3 = dumpChunks(4, dst);
  expect(b3).toEqual([
    "00 00 00 00", // not changed
    "08 04 08 FF",
    "FF FF FF FF",
    "00 00 FF FF",
    "00 FF 00 FF",
    "FF 00 00 FF",
    "18 08 08 FF",
    "31 14 21 FF",
    "4A 20 39 FF",
    "F7 41 7B FF",
    "00 00 00 00", // not changed
  ]);
});
