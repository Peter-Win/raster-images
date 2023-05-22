import { createInfo } from "../../ImageInfo";
import { Point } from "../../math/Point";
import { dump } from "../../utils";
import { SurfaceStd } from "../SurfaceStd";

describe("SurfaceStd", () => {
  it("constructor", () => {
    const surface = new SurfaceStd(createInfo(4, 3, 8));
    expect(surface.width).toBe(4);
    expect(surface.height).toBe(3);
    expect(surface.colorModel).toBe("Gray");
    expect(surface.bitsPerPixel).toBe(8);
    expect(surface.rowSize).toBe(4);
    surface.fill(0);
    const row1 = surface.getRowBufferClamped(1);
    row1.fill(0xff);
    expect(surface.data.byteLength).toBe(12);
    expect(dump(surface.data)).toBe("00 00 00 00 FF FF FF FF 00 00 00 00");
  });
  it("constructor from buffer", () => {
    const pixels = new Uint8Array(12);
    for (let i = 0; i < pixels.byteLength; i++) pixels[i] = i + 1;
    const img = new SurfaceStd(createInfo(4, 3, 8), pixels);
    expect(img.width).toBe(4);
    expect(img.height).toBe(3);
    expect(img.colorModel).toBe("Gray");
    expect(img.bitsPerPixel).toBe(8);
    const row1 = img.getRowBufferClamped(1);
    expect(row1.toString()).toBe("5,6,7,8");
  });
  it("create", () => {
    const img = SurfaceStd.create(5, 3, 24);
    expect(img.width).toBe(5);
    expect(img.height).toBe(3);
    expect(img.size).toEqual(new Point(5, 3));
    expect(img.bitsPerPixel).toBe(24);
    expect(img.colorModel).toBe("RGB");
  });
});
