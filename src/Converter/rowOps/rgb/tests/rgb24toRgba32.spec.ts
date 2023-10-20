import { dump, dumpChunks, subBuffer } from "../../../../utils";
import { rgb24toRgba32, rgb24toRgba32AndSwapRB } from "../rgb24toRgba32";

test("rgb24toRgba32", () => {
  // ignor  <---    cvt    --->  ignor
  //   0  |   1  |   2  |   3  |   4
  // 0 1 2; 3 4 5; 6 7 8; 9 A B; C D E
  const totalLength = 5;
  const cvtStart = 1;
  const width = 3;
  const src = new Uint8Array(totalLength * 3);
  for (let i = 0; i < src.length; i++) src[i] = i;
  const dst = new Uint8Array(totalLength * 4);

  rgb24toRgba32(
    width,
    subBuffer(src, cvtStart * 3),
    subBuffer(dst, cvtStart * 4)
  );
  expect(dump(dst)).toBe(
    // 0 (ignor)|     1     |     2     |     3     | 4 ignor
    "00 00 00 00 03 04 05 FF 06 07 08 FF 09 0A 0B FF 00 00 00 00"
  );
});

test("rgb24toRgba32AndSwapRB", () => {
  const width = 2;
  const offs = 1;
  const size = width + offs + 1;
  const src = new Uint8Array(size * 3);
  const dst = new Uint8Array(size * 4);
  for (let i = 0; i < src.length; i++) src[i] = i;
  dst.fill(0xaa);

  rgb24toRgba32AndSwapRB(
    width,
    subBuffer(src, 3 * offs),
    subBuffer(dst, 4 * offs)
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
