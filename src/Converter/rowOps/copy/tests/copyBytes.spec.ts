import { copyBytes } from "../copyBytes";

test("copyBytes", () => {
  //                             v--------v
  const src = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
  const dst = new Uint8Array([8, 9, 10, 11, 12, 13, 14, 15]);
  //                                ^------------^
  copyBytes(4, src, 1, dst, 2);
  expect(Array.from(dst)).toEqual([8, 9, 1, 2, 3, 4, 14, 15]);
});
