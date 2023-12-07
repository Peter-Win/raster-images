import { Palette } from "../../../../Palette";
import { analyzePaletteTransparency } from "../../../../Palette/analyzePaletteTransparency";
import { dump } from "../../../../utils";
import {
  buildTransparentPalette,
  transparencyFromPalette,
} from "../PngTransparency";

describe("buildTransparentPalette", () => {
  it("full opaque", () => {
    const srcPalette: Palette = [
      [0, 0, 0, 0xff],
      [1, 1, 1, 0xff],
    ];
    const trns = new Uint8Array([0xff, 0xff]);
    const dstPalette = buildTransparentPalette(srcPalette, trns);
    expect(analyzePaletteTransparency(dstPalette)).toEqual({ type: "opaque" });
  });

  it("transparency index", () => {
    const srcPalette: Palette = [
      [0, 0, 0, 0xff],
      [1, 1, 1, 0xff],
      [0xff, 0xff, 0xff, 0xff],
    ];
    const trns = new Uint8Array([0xff, 0xff, 0]);
    const dstPalette = buildTransparentPalette(srcPalette, trns);
    expect(analyzePaletteTransparency(dstPalette)).toEqual({
      type: "transparency",
      index: 2,
    });
  });

  it("full opaque", () => {
    const srcPalette: Palette = [
      [0, 0, 0, 0xff],
      [1, 1, 1, 0xff],
      [2, 2, 2, 0xff],
    ];
    const trns = new Uint8Array([0xff, 0xff, 0x80]);
    const dstPalette = buildTransparentPalette(srcPalette, trns);
    expect(analyzePaletteTransparency(dstPalette)).toEqual({ type: "alpha" });
  });
});

test("transparencyFromPalette", () => {
  const srcPal: Palette = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
  ];
  const buf = transparencyFromPalette(srcPal);
  expect(dump(buf)).toBe("04 08 0C");
});
