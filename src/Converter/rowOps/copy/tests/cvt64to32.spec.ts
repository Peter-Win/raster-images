import { cvt64to32 } from "../cvt64to32";

test("cvt64to32", () => {
  // Here are only numbers that can be converted from 64 to 32 without loss of precision.
  const src = [0, 1, -1, 0.5, -1.25];
  const count = src.length;
  const fsrc = new Float64Array(src);
  const bsrc = new Uint8Array(fsrc.buffer, fsrc.byteOffset);
  const fdst = new Float32Array(count);
  const bdst = new Uint8Array(fdst.buffer, fdst.byteOffset);
  cvt64to32(count, bsrc, bdst);
  expect(Array.from(fdst)).toEqual(src);
});
