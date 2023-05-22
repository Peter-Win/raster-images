import { readPaletteFromBuf } from "../readPalette";

describe("readPaletteFromBuf", () => {
  it("standard", () => {
    // black, blue, green, red, white
    const buf = new Uint8Array([
      0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255,
    ]);
    const pal = readPaletteFromBuf(buf, 5, {});
    expect(pal).toEqual([
      [0, 0, 0, 255],
      [255, 0, 0, 255],
      [0, 255, 0, 255],
      [0, 0, 255, 255],
      [255, 255, 255, 255],
    ]);
  });
  it("dword", () => {
    // black, blue, green, red, white
    const buf = new Uint8Array([
      0, 0, 0, 0, 255, 0, 0, 128, 0, 255, 0, 128, 0, 0, 255, 128, 255, 255, 255,
      255,
    ]);
    const pal = readPaletteFromBuf(buf, 5, { dword: true });
    expect(pal).toEqual([
      [0, 0, 0, 0],
      [255, 0, 0, 128],
      [0, 255, 0, 128],
      [0, 0, 255, 128],
      [255, 255, 255, 255],
    ]);
  });
  it("rgb", () => {
    // black, blue, green, red, white
    const buf = new Uint8Array([
      0, 0, 0, 0, 0, 200, 0, 200, 0, 200, 0, 0, 255, 255, 255,
    ]);
    const pal = readPaletteFromBuf(buf, 5, { rgb: true });
    expect(pal).toEqual([
      [0, 0, 0, 255],
      [200, 0, 0, 255],
      [0, 200, 0, 255],
      [0, 0, 200, 255],
      [255, 255, 255, 255],
    ]);
  });
  it("6 bit", () => {
    // black, blue, green, red, white
    const buf = new Uint8Array([
      0, 0, 0, 0x3f, 0, 0, 0, 0x1f, 0, 0, 0, 0x30, 0x3f, 0x3f, 0x3f,
    ]);
    const pal = readPaletteFromBuf(buf, 5, { bits6: true });
    expect(pal).toEqual([
      [0, 0, 0, 255],
      [255, 0, 0, 255],
      [0, 125, 0, 255],
      [0, 0, 192 + 3, 255],
      [255, 255, 255, 255],
    ]);
  });
});
