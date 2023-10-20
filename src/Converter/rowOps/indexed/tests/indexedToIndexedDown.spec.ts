import { dump } from "../../../../utils";
import { pack8to4bits, pack8to1bit } from "../indexedToIndexedDown";

test("pack8to4bits", () => {
  const src = new Uint8Array([14, 15, 0, 1]);
  const dst = new Uint8Array(2);
  pack8to4bits(4, src, dst);
  expect(dump(dst)).toBe("EF 01");
});

test("pack8to1bit", () => {
  const srcA = [
    [1, 0, 1, 1, 1, 0, 1, 0],
    [1, 1, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 1],
  ].flatMap((n) => n);
  const src = new Uint8Array(srcA);
  const dst = new Uint8Array(4);
  pack8to1bit(src.length, src, dst);
  expect(dump(dst)).toBe("BA DF 00 D0");
});
