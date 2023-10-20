import { Palette } from "../../../../Palette";
import { analyzePaletteTransparency } from "../../../../Palette/analyzePaletteTransparency";
import { buildTransparentPalette } from "../PngTransparency";

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
