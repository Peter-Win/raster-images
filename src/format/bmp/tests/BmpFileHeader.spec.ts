import {
  readBmpFileHeader,
  writeBmpFileHeader,
  BmpFileHeader,
  bmpFileHeaderSize,
  bmpSignature,
} from "../BmpFileHeader";

const example: number[] = [
  0x42, 0x4d, 0x76, 0x38, 0, 0, 0, 0, 0, 0, 0x36, 0, 0, 0,
];

const strA = (a: number[]): string[] => a.map((v) => v.toString(16));

test("readBmpFileHeader", () => {
  const b = new Uint8Array(example);
  expect(readBmpFileHeader(b.buffer, b.byteOffset)).toEqual({
    bfType: bmpSignature,
    bfSize: 0x3876,
    bfOffBits: 0x36,
  });
});

test("writeBmpFileHeader", () => {
  const bfh: BmpFileHeader = {
    bfSize: 0x3876,
    bfOffBits: 0x36,
  };
  const b = new Uint8Array(bmpFileHeaderSize);
  writeBmpFileHeader(bfh, b.buffer, b.byteOffset);
  expect(strA(Array.from(b))).toEqual(strA(example));
});
