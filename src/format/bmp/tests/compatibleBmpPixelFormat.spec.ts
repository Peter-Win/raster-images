import { PixelFormat } from "../../../PixelFormat";
import { compatibleBmpPixelFormat } from "../compatibleBmpPixelFormat";

const fromSign = (sign: string) =>
  compatibleBmpPixelFormat(new PixelFormat(sign)).signature;

describe("compatibleBmpPixelFormat", () => {
  it("bmp formats", () => {
    expect(fromSign("B5G5R5")).toBe("B5G5R5");
    expect(fromSign("B5G6R5")).toBe("B5G6R5");
    expect(fromSign("B8G8R8")).toBe("B8G8R8");
    expect(fromSign("B8G8R8A8")).toBe("B8G8R8A8");
    expect(fromSign("I1")).toBe("I1");
    expect(fromSign("I4")).toBe("I4");
    expect(fromSign("I8")).toBe("I8");
  });
  it("non-bmp formats", () => {
    // rgb
    expect(fromSign("R8G8B8")).toBe("B8G8R8");
    expect(fromSign("R8G8B8A8")).toBe("B8G8R8A8");
    expect(fromSign("R16G16B16")).toBe("B8G8R8");
    expect(fromSign("B16G16R16")).toBe("B8G8R8");
    expect(fromSign("R16G16B16A16")).toBe("B8G8R8A8");
    expect(fromSign("B16G16R16A16")).toBe("B8G8R8A8");
    // gray
    expect(fromSign("G1")).toBe("I1");
    expect(fromSign("G4")).toBe("I4");
    expect(fromSign("G8")).toBe("I8");
  });
});
