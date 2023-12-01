import { rgb32swap } from "../rgb32";

test("rgb32swap", () => {
  const fsrc = new Float32Array([0, 0.125, 0.25, 0.5, 0.75, 1]);
  const width = fsrc.length / 3;
  const fdst = new Float32Array(width * 3);
  const bsrc = new Uint8Array(fsrc.buffer, fsrc.byteOffset);
  const bdst = new Uint8Array(fdst.buffer, fdst.byteOffset);
  rgb32swap(width, bsrc, bdst);
  expect(Array.from(fdst)).toEqual([0.25, 0.125, 0, 1, 0.75, 0.5]);
});
