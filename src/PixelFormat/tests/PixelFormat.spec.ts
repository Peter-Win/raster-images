import { dumpA } from "../../utils";
import { PixelFormat } from "../PixelFormat";

describe("PixelFormat", () => {
  it("default constructor", () => {
    const pf = new PixelFormat();
    expect(pf.signature).toBe("");
    expect(pf.depth).toBe(0);
    expect(pf.colorModel).toBe("Unknown");
  });
  it("short constructor", () => {
    const rgb24 = new PixelFormat(24);
    expect(rgb24.signature).toBe("B8G8R8");
    expect(rgb24.depth).toBe(24);
    expect(rgb24.colorModel).toBe("RGB");

    const rgb16 = new PixelFormat(16);
    expect(rgb16.signature).toBe("B5G6R5");
    expect(rgb16.depth).toBe(16);
    expect(rgb16.colorModel).toBe("RGB");
    expect(dumpA(rgb16.sampleBitMasks)).toBe("1F 07E0 F800");

    const g8 = new PixelFormat(8);
    expect(g8.signature).toBe("G8");
    expect(g8.colorModel).toBe("Gray");
    expect(g8.depth).toBe(8);
    // expect(g8.sampleBitMasks).toEqual([0xFF]);

    const ga16 = new PixelFormat(32, "Gray", true);
    expect(ga16.signature).toBe("G16A16");
    expect(ga16.colorModel).toBe("Gray");
    expect(ga16.depth).toBe(32);
    expect(ga16.alpha).toBe(true);
    // expect(ga16.sampleBitMasks).toEqual([0xFFFF, 0xFFFF0000]);
  });

  it("constructor from PixelFormatDef", () => {
    const pf = new PixelFormat({ depth: 40, colorModel: "CMYK" });
    expect(pf.signature).toBe("C8M8Y8K8A8");
    expect(pf.depth).toBe(40);
    expect(pf.alpha).toBe(true);
    expect(pf.colorModel).toBe("CMYK");
    expect(dumpA(pf.sampleBitMasks)).toBe("FF FF00 FF0000 FF000000 FF00000000");
  });

  it("constructor from signature", () => {
    const rgba16 = new PixelFormat("B4G4R4A4");
    expect(rgba16.colorModel).toBe("RGB");
    expect(rgba16.alpha).toBe(true);
    expect(rgba16.depth).toBe(16);
    expect(rgba16.signature).toBe("B4G4R4A4");
    expect(dumpA(rgba16.sampleBitMasks)).toBe("0F F0 0F00 F000");
  });

  it("constructor from samples", () => {
    const pf15 = new PixelFormat([
      { sign: "B", shift: 0, length: 5 },
      { sign: "G", shift: 5, length: 5 },
      { sign: "R", shift: 10, length: 5 },
    ]);
    expect(pf15.signature).toBe("B5G5R5");
    expect(pf15.depth).toBe(15);
    expect(pf15.alpha).toBe(false);
    expect(pf15.colorModel).toBe("RGB");
    expect(dumpA(pf15.sampleBitMasks)).toBe("1F 03E0 7C00");
  });

  it("equals", () => {
    expect(new PixelFormat(24).equals(new PixelFormat("B8G8R8"))).toBe(true);
    expect(new PixelFormat(24).equals(new PixelFormat("R8G8B8"))).toBe(false);

    expect(new PixelFormat(16).equals(new PixelFormat("G16"))).toBe(false);
    expect(new PixelFormat(16, "Gray").equals(new PixelFormat("G16"))).toBe(
      true
    );
    expect(new PixelFormat(16).equals(new PixelFormat("B5G6R5"))).toBe(true);
  });
});
