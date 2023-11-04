import { compatibleTargaPixelFormat } from "../compatibleTargaPixelFormat";
import { PixelFormat } from "../../../PixelFormat";
import { createGrayPalette, paletteEGA } from "../../../Palette";
import { dumpA } from "../../../utils";

const compatibleSign = (sign: string) =>
  compatibleTargaPixelFormat(new PixelFormat(sign)).signature;

describe("compatibleTargaPixelFormat", () => {
  it("RGB", () => {
    expect(compatibleSign("B5G5R5")).toBe("B5G5R5");
    expect(compatibleSign("B5G6R5")).toBe("B5G5R5");

    expect(compatibleSign("B8G8R8")).toBe("B8G8R8");
    expect(compatibleSign("R8G8B8")).toBe("B8G8R8");
    expect(compatibleSign("B16G16R16")).toBe("B8G8R8");
    expect(compatibleSign("R16G16B16")).toBe("B8G8R8");

    expect(compatibleSign("B8G8R8A8")).toBe("B8G8R8A8");
    expect(compatibleSign("R8G8B8A8")).toBe("B8G8R8A8");
    expect(compatibleSign("B16G16R16A16")).toBe("B8G8R8A8");
    expect(compatibleSign("R16G16B16A16")).toBe("B8G8R8A8");
  });

  it("Gray", () => {
    expect(compatibleSign("G1")).toBe("G8");
    expect(compatibleSign("G4")).toBe("G8");
    expect(compatibleSign("G8")).toBe("G8");
    expect(compatibleSign("G16")).toBe("G8");
    expect(compatibleSign("G8A8")).toBe("B8G8R8A8");
    expect(compatibleSign("G16A16")).toBe("B8G8R8A8");
  });

  it("Indexed", () => {
    const pfI1 = compatibleTargaPixelFormat(
      new PixelFormat(1, createGrayPalette(2))
    );
    expect(pfI1.signature).toBe("I8");
    expect(pfI1.palette?.length).toBe(2);
    expect(dumpA(pfI1.palette![0]!)).toBe("00 00 00 FF");
    expect(dumpA(pfI1.palette![1]!)).toBe("FF FF FF FF");

    const pfI4 = compatibleTargaPixelFormat(new PixelFormat(4, paletteEGA));
    expect(compatibleSign("I4")).toBe("I8");
    expect(dumpA(pfI4.palette![0]!)).toBe("00 00 00 FF");
    expect(dumpA(pfI4.palette![14]!)).toBe("55 FF FF FF");
    expect(dumpA(pfI4.palette![15]!)).toBe("FF FF FF FF");

    expect(compatibleSign("I8")).toBe("I8");
    expect(compatibleSign("J8")).toBe("B8G8R8A8");
  });

  it("another", () => {
    expect(compatibleSign("C8M8Y8K8")).toBe("B8G8R8");
    expect(compatibleSign("C8M8Y8K8A8")).toBe("B8G8R8A8");
  });
});
