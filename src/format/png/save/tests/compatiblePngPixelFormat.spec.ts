import { createGrayPalette, paletteEGA } from "../../../../Palette";
import { PixelFormat } from "../../../../PixelFormat";
import { compatiblePngPixelFormat } from "../compatiblePngPixelFormat";

describe("compatiblePngPixelFormat", () => {
  it("indexed", () => {
    const palBW = createGrayPalette(2);
    const i1 = compatiblePngPixelFormat(new PixelFormat(1, palBW));
    expect(i1.signature).toBe("I1");
    expect(i1.palette).toEqual(palBW);

    const pal4 = createGrayPalette(4);
    const i2 = compatiblePngPixelFormat(new PixelFormat(2, pal4));
    expect(i2.signature).toBe("I2");
    expect(i2.palette).toEqual(pal4);

    const i4 = compatiblePngPixelFormat(new PixelFormat(4, paletteEGA));
    expect(i4.signature).toBe("I4");
    expect(i4.palette).toEqual(paletteEGA);

    const i8 = compatiblePngPixelFormat(new PixelFormat(8, paletteEGA));
    expect(i8.signature).toBe("I8");
    expect(i8.palette).toEqual(paletteEGA);
  });

  const mkSign = (srcSign: string): string =>
    compatiblePngPixelFormat(new PixelFormat(srcSign)).signature;

  it("Gray", () => {
    expect(mkSign("G1")).toBe("G1");
    expect(mkSign("G2")).toBe("G2");
    expect(mkSign("G4")).toBe("G4");
    expect(mkSign("G8")).toBe("G8");
    expect(mkSign("G16")).toBe("G16");
    expect(mkSign("G32")).toBe("G16");
    expect(mkSign("G8A8")).toBe("G8A8");
    expect(mkSign("G16A16")).toBe("G16A16");
    expect(mkSign("G32A32")).toBe("G16A16");
  });

  it("RGB", () => {
    expect(mkSign("B5G5R5")).toBe("R8G8B8");
    expect(mkSign("B5G6B5")).toBe("R8G8B8");
    expect(mkSign("B8G8R8")).toBe("R8G8B8");
    expect(mkSign("R8G8B8")).toBe("R8G8B8");
    expect(mkSign("R16G16B16")).toBe("R16G16B16");
    expect(mkSign("B16G18R16")).toBe("R16G16B16");
    expect(mkSign("R32G32B32")).toBe("R16G16B16");
    expect(mkSign("B32G32R32")).toBe("R16G16B16");

    expect(mkSign("R4G4B4A4")).toBe("R8G8B8A8");
    expect(mkSign("B8G8R8A8")).toBe("R8G8B8A8");
    expect(mkSign("R8G8B8A8")).toBe("R8G8B8A8");
    expect(mkSign("B16G16R16A16")).toBe("R16G16B16A16");
    expect(mkSign("R16G16B16A16")).toBe("R16G16B16A16");
    expect(mkSign("B32G32R32A32")).toBe("R16G16B16A16");
    expect(mkSign("R32G32B32A32")).toBe("R16G16B16A16");
  });

  it("CMYK", () => {
    expect(mkSign("C8M8Y8K8")).toBe("R8G8B8");
    expect(mkSign("C16M16Y16K16")).toBe("R16G16B16");
    expect(mkSign("C32M32Y32K32")).toBe("R16G16B16");

    expect(mkSign("C8M8Y8K8A8")).toBe("R8G8B8A8");
    expect(mkSign("C16M16Y16K16A16")).toBe("R16G16B16A16");
    expect(mkSign("C32M32Y32K32A32")).toBe("R16G16B16A16");
  });
});
