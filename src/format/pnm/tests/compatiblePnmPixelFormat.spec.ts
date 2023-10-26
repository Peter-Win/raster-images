import { PixelFormat } from "../../../PixelFormat";
import { compatiblePnmPixelFormat } from "../compatiblePnmPixelFormat";

const cvt = (srcSign: string): string =>
  compatiblePnmPixelFormat(new PixelFormat(srcSign)).signature;

describe("compatiblePnmPixelFormat", () => {
  it("compatible", () => {
    expect(cvt("G1")).toBe("G1");
    expect(cvt("G8")).toBe("G8");
    expect(cvt("G16")).toBe("G16");
    expect(cvt("R8G8B8")).toBe("R8G8B8");
    expect(cvt("R16G16B16")).toBe("R16G16B16");
  });
  it("gray conversion", () => {
    expect(cvt("G4")).toBe("G8");
    expect(cvt("G8A8")).toBe("G8");
    expect(cvt("G16A16")).toBe("G16");
  });
  it("rgb conversion", () => {
    expect(cvt("B5G5B5")).toBe("R8G8B8");
    expect(cvt("B8G8B8")).toBe("R8G8B8");
    expect(cvt("B8G8B8A8")).toBe("R8G8B8");
    expect(cvt("B16G16B16")).toBe("R16G16B16");
    expect(cvt("I8")).toBe("R8G8B8");
    expect(cvt("C8M8Y8K8")).toBe("R8G8B8");
  });
});
