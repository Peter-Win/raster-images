import { PixelFillerCtx } from "../PixelFiller";
import { pixelFiller1 } from "../pixelFiller1";
import { dump } from "../../../utils";

test("pixelFiller1", () => {
  const src = new Uint8Array([0xa5, 0xf0]);
  const dst = new Uint8Array(2);
  const ctx: PixelFillerCtx = { src, dst };

  pixelFiller1(ctx, 0, 2); // *1010 => 00*10
  expect(dump(dst)).toBe("20 00");
  pixelFiller1(ctx, 1, 3); // 1*010 => 001*0
  expect(dump(dst)).toBe("20 00");
  pixelFiller1(ctx, 2, 4); // 10*10 => 0010 *1000
  expect(dump(dst)).toBe("28 00");
  pixelFiller1(ctx, 3, 5); // 101*0 => 0010 1*000
  expect(dump(dst)).toBe("28 00");
  pixelFiller1(ctx, 4, 6); // 1010 *0101 => 0010 10*00
  expect(dump(dst)).toBe("28 00");
  pixelFiller1(ctx, 5, 7); // 1010 0*101 => 0010 100*1
  expect(dump(dst)).toBe("29 00");
  pixelFiller1(ctx, 6, 8); // 1010 01*01 => 0010 1001 *0000
  expect(dump(dst)).toBe("29 00");
  pixelFiller1(ctx, 7, 9); // 1010 010*1 => 0010 1001 0*100
  expect(dump(dst)).toBe("29 40");
  pixelFiller1(ctx, 8, 10); // 1010 0101 *1111 => 0010 1001 01*10
  expect(dump(dst)).toBe("29 60");
  pixelFiller1(ctx, 9, 11); // 1010 0101 1*111 => 0010 1001 011*1
  expect(dump(dst)).toBe("29 70");

  dst.fill(0xff);
  pixelFiller1(ctx, 0, 2); // *1010 => 11*11
  expect(dump(dst)).toBe("FF FF");
  pixelFiller1(ctx, 1, 3); // 1*010 => 111*0
  expect(dump(dst)).toBe("EF FF");
  pixelFiller1(ctx, 2, 4); // 10*10 => 1110 *1111
  expect(dump(dst)).toBe("EF FF");
  pixelFiller1(ctx, 3, 5); // 101*0 => 1110 1*011
  expect(dump(dst)).toBe("EB FF");
  pixelFiller1(ctx, 4, 6); // 1010 *0101 => 1110 10*01
  expect(dump(dst)).toBe("E9 FF");
  pixelFiller1(ctx, 5, 7); // 1010 0*101 => 1110 100*1
  expect(dump(dst)).toBe("E9 FF");
  pixelFiller1(ctx, 6, 8); // 1010 01*01 => 1110 1001 *0111
  expect(dump(dst)).toBe("E9 7F");
  pixelFiller1(ctx, 7, 9); // 1010 010*1 => 1110 1001 0*111
  expect(dump(dst)).toBe("E9 7F");
  pixelFiller1(ctx, 8, 10); // 1010 0101 *1111 => 1110 1001 01*11
  expect(dump(dst)).toBe("E9 7F");
  pixelFiller1(ctx, 9, 11); // 1010 0101 1*111 => 1110 1001 011*1
  expect(dump(dst)).toBe("E9 7F");
});
