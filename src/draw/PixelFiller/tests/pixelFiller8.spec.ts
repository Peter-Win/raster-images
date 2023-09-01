import { dump } from "../../../utils";
import { PixelFillerCtx } from "../PixelFiller";
import { pixelFiller8 } from "../pixelFiller8";

test("pixelFiller8", () => {
  //                          0     1     2     3     4     5     6     7
  const src = new Uint8Array([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]);
  const dst = new Uint8Array(5);
  dst.fill(0x55);
  const ctx: PixelFillerCtx = { src, dst };
  pixelFiller8(ctx, 6, 1);
  expect(dump(dst)).toBe("55 CD 55 55 55");
  pixelFiller8(ctx, 1, 2);
  expect(dump(dst)).toBe("55 CD 23 55 55");
  pixelFiller8(ctx, 7, 3);
  expect(dump(dst)).toBe("55 CD 23 EF 55");
  pixelFiller8(ctx, 0, 4);
  expect(dump(dst)).toBe("55 CD 23 EF 01");
});
