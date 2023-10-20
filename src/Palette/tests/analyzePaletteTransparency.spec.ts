import { Palette } from "../Palette";
import { analyzePaletteTransparency } from "../analyzePaletteTransparency";

describe("analyzePaletteTransparency", () => {
  it("opaque", () => {
    const palette: Palette = [
      [0, 0, 0, 0xff],
      [1, 1, 1, 0xff],
    ];
    expect(analyzePaletteTransparency(palette)).toEqual({ type: "opaque" });
  });
  it("transparency", () => {
    const palette: Palette = [
      [0, 0, 0, 0xff],
      [1, 1, 1, 0xff],
      [0xff, 0xff, 0xff, 0],
    ];
    expect(analyzePaletteTransparency(palette)).toEqual({
      type: "transparency",
      index: 2,
    });
  });
  it("alpha", () => {
    const palette: Palette = [
      [0, 0, 0, 0xff],
      [1, 1, 1, 0x80],
    ];
    expect(analyzePaletteTransparency(palette)).toEqual({ type: "alpha" });
  });
});
