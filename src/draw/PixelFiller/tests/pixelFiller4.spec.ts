import { dump } from "../../../utils";
import { PixelFillerCtx } from "../PixelFiller";
import { pixelFiller4 } from "../pixelFiller4";

test("pixelFiller4", () => {
  const src = new Uint8Array([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]);
  const dst = new Uint8Array(3);
  dst.fill(0x55);
  const ctx: PixelFillerCtx = { src, dst };
  pixelFiller4(ctx, 12, 1);
  expect(dump(dst)).toBe("5C 55 55");
  pixelFiller4(ctx, 1, 2);
  expect(dump(dst)).toBe("5C 15 55");
  pixelFiller4(ctx, 7, 3);
  expect(dump(dst)).toBe("5C 17 55");
  pixelFiller4(ctx, 0, 4);
  expect(dump(dst)).toBe("5C 17 05");
});
