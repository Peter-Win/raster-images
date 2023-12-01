import { BufferStream } from "../../../stream";
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

test("readBmpFileHeader", async () => {
  const s = new BufferStream(new Uint8Array(example));
  expect(await readBmpFileHeader(s)).toEqual({
    bfType: bmpSignature,
    bfSize: 0x3876,
    bfOffBits: 0x36,
  });
});

test("writeBmpFileHeader", async () => {
  const bfh: BmpFileHeader = {
    bfSize: 0x3876,
    bfOffBits: 0x36,
  };
  const buf = new Uint8Array(bmpFileHeaderSize);
  const stream = new BufferStream(buf, { size: 0 });
  await writeBmpFileHeader(bfh, stream);
  expect(strA(Array.from(buf))).toEqual(strA(example));
});
