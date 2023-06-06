import { dump, dumpChunks } from "../../../utils";
import { Cvt24to32, Cvt24to32AndSwapRB } from "../Cvt24to32";

test("Cvt24to32", () => {
  // ignor  <---    cvt    --->  ignor
  //   0  |   1  |   2  |   3  |   4
  // 0 1 2; 3 4 5; 6 7 8; 9 A B; C D E
  const totalLength = 5;
  const cvtStart = 1;
  const width = 3;
  const src = new Uint8Array(totalLength * 3);
  for (let i = 0; i < src.length; i++) src[i] = i;
  const dst = new ArrayBuffer(totalLength * 4);

  Cvt24to32.cvt(width, src.buffer, cvtStart * 3, dst, cvtStart * 4);
  expect(dump(new Uint8Array(dst))).toBe(
    // 0 (ignor)|     1     |     2     |     3     | 4 ignor
    "00 00 00 00 03 04 05 FF 06 07 08 FF 09 0A 0B FF 00 00 00 00"
  );
});

test("Cvt24to32AndSwapRB", () => {
  const width = 2;
  const offs = 1;
  const size = width + offs + 1;
  const src = new Uint8Array(size * 3);
  const dst = new Uint8Array(size * 4);
  for (let i = 0; i < src.length; i++) src[i] = i;
  dst.fill(0xaa);

  Cvt24to32AndSwapRB.cvt(
    width,
    src.buffer,
    src.byteOffset + 3 * offs,
    dst.buffer,
    dst.byteOffset + 4 * offs
  );
  // 0 1 2 3 4 5 6 7 8
  // * * * 5 4 3 8 7 6 * * *
  expect(dumpChunks(4, dst)).toEqual([
    "AA AA AA AA",
    "05 04 03 FF",
    "08 07 06 FF",
    "AA AA AA AA",
  ]);
});
