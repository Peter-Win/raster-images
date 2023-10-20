import { dumpChunks, subBuffer } from "../../../../utils";
import { rgb15to24Quality, rgb15to24Fast } from "../rgb15to24";

// max value = 31
const pk = (r5: number, g5: number, b5: number): number =>
  b5 | (g5 << 5) | (r5 << 10);

const srcRow: number[] = [
  pk(0xb, 0xa, 0xd), // 0 - don't cvt
  pk(1, 1, 1), // 1
  pk(31, 31, 31), // 2
  pk(31, 0, 0), // 3
  pk(0, 31, 0), // 4
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

test("rgb15to24Quality", () => {
  const src = new Uint16Array(srcRow);
  const dst = new Uint8Array(3 * srcRow.length);
  rgb15to24Quality(
    cvtLength,
    new Uint8Array(src.buffer, src.byteOffset + 2 * startPos),
    subBuffer(dst, 3 * startPos)
  );
  const b3 = dumpChunks(3, dst);
  expect(b3).toEqual([
    "00 00 00", // not changed
    "08 08 08",
    "FF FF FF",
    "00 00 FF",
    "00 FF 00",
    "FF 00 00",
    "18 10 08", // +0
    "31 29 21", // +1
    "4A 42 39", // +2 +2 +1
    "F7 84 7B", // 0b1111011 = 7B, 1.0000 => 100 | 1000.0000 = 1000.0100 = 84, F7=11110111
    "00 00 00", // not changed
  ]);
});

test("rgb15to24Fast", () => {
  const src = new Uint16Array(srcRow);
  const dst = new Uint8Array(3 * srcRow.length);
  rgb15to24Fast(
    cvtLength,
    new Uint8Array(src.buffer, src.byteOffset + 2 * startPos),
    subBuffer(dst, 3 * startPos)
  );
  const b3 = dumpChunks(3, dst);
  expect(b3).toEqual([
    "00 00 00",
    "08 08 08",
    "F8 F8 F8",
    "00 00 F8",
    "00 F8 00",
    "F8 00 00",
    "18 10 08",
    "30 28 20",
    "48 40 38",
    "F0 80 78",
    "00 00 00",
  ]);
});
