import { dump, dumpA } from "../../../utils";
import { PixelFillerCtx } from "../PixelFiller";
import { pixelFillerN } from "../pixelFillerN";

describe("pixelFillerN", () => {
  it("16 bits", () => {
    const src = new Uint16Array([1, 0x110, 0x2345, 0xfefe]);
    const dst = new Uint16Array(5);
    dst.fill(0x5555);
    const ctx: PixelFillerCtx = {
      src: new Uint8Array(src.buffer, src.byteOffset),
      dst: new Uint8Array(dst.buffer, dst.byteOffset),
    };
    const fn = pixelFillerN(2);
    fn(ctx, 3, 1);
    expect(dumpA(Array.from(dst))).toBe("5555 FEFE 5555 5555 5555");
    fn(ctx, 2, 2);
    expect(dumpA(Array.from(dst))).toBe("5555 FEFE 2345 5555 5555");
    fn(ctx, 1, 3);
    expect(dumpA(Array.from(dst))).toBe("5555 FEFE 2345 0110 5555");
    fn(ctx, 0, 4);
    expect(dumpA(Array.from(dst))).toBe("5555 FEFE 2345 0110 01");
  });

  it("24 bits", () => {
    //                          0:red,      1:yellow,      2:green     3:cyan
    const src = new Uint8Array([
      0xfe, 0, 0, 0xfc, 0xfd, 1, 2, 0xfb, 2, 3, 3, 0xfa,
    ]);
    const dst = new Uint8Array(5 * 3);
    dst.fill(0x55);
    const ctx: PixelFillerCtx = { src, dst };
    const fn = pixelFillerN(3);
    fn(ctx, 1, 3);
    //                      0        1        2        3        4
    expect(dump(dst)).toBe("55 55 55 55 55 55 55 55 55 FC FD 01 55 55 55");
    fn(ctx, 3, 0);
    expect(dump(dst)).toBe("03 03 FA 55 55 55 55 55 55 FC FD 01 55 55 55");
    fn(ctx, 0, 1);
    expect(dump(dst)).toBe("03 03 FA FE 00 00 55 55 55 FC FD 01 55 55 55");
  });
});
