import { dump } from "../../../utils";
import { SwapRedBlue24 } from "../SwapRedBlue";

test("SwapRedBlue24", () => {
  const width = 2;
  const size = width + 2;
  const offs = 1;
  const src = new Uint8Array(size * 3);
  const dst = new Uint8Array(size * 3);
  dst.fill(255);
  // src 0 1 2 3 4 5 6 7 8 9 10 11
  // dst * * * 5 4 3 8 7 6 * *  *
  for (let i = 0; i < src.length; i++) src[i] = i;
  SwapRedBlue24.cvt(
    width,
    src.buffer,
    src.byteOffset + offs * 3,
    dst.buffer,
    dst.byteOffset + offs * 3
  );
  expect(dump(dst)).toBe("FF FF FF 05 04 03 08 07 06 FF FF FF");
});
