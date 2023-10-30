import { TargaImageDescriptor, TargaImageType } from "../TargaHeader";
import { targaHeaderAnalyze } from "../targaHeaderAnalyze";

describe("targaHeaderAnalyze", () => {
  it("noImageData", () => {
    expect(() =>
      targaHeaderAnalyze({
        idLength: 0,
        colorMapType: 0,
        imageType: TargaImageType.noImageData,
        colorMapStart: 0,
        colorMapLength: 0,
        colorItemSize: 0,
        x0: 0,
        y0: 0,
        width: 0,
        height: 0,
        depth: 24,
        imageDescriptor: 0,
      })
    ).toThrowError("No image data included");
  });

  it("uncompressedColorMapped", () => {
    const { info, options } = targaHeaderAnalyze({
      idLength: 0,
      colorMapType: 1,
      imageType: TargaImageType.uncompressedColorMapped,
      colorMapStart: 0,
      colorMapLength: 256,
      colorItemSize: 32,
      x0: 0,
      y0: 0,
      width: 321,
      height: 210,
      depth: 8,
      imageDescriptor: TargaImageDescriptor.top2bottom,
    });
    expect(info.size.toString()).toBe("(321, 210)");
    expect(info.fmt.signature).toBe("I8");
    expect(options).toEqual({
      compression: false,
      top2bottom: true,
      right2left: false,
      orgX: 0,
      orgY: 210,
    });
  });

  it("uncompressedTrueColor", () => {
    const { info, options } = targaHeaderAnalyze({
      idLength: 0,
      colorMapType: 0,
      imageType: TargaImageType.uncompressedTrueColor,
      colorMapStart: 0,
      colorMapLength: 0,
      colorItemSize: 0,
      x0: 444,
      y0: 0,
      width: 444,
      height: 333,
      depth: 24,
      imageDescriptor: TargaImageDescriptor.right2left,
    });
    expect(info.size.toString()).toBe("(444, 333)");
    expect(info.fmt.signature).toBe("B8G8R8");
    expect(options).toEqual({
      compression: false,
      top2bottom: false,
      right2left: true,
    });
  });

  it("uncompressedGray", () => {
    const { info, options } = targaHeaderAnalyze({
      idLength: 0,
      colorMapType: 0,
      imageType: TargaImageType.uncompressedGray,
      colorMapStart: 0,
      colorMapLength: 0,
      colorItemSize: 0,
      x0: 0,
      y0: 10,
      width: 400,
      height: 300,
      depth: 8,
      imageDescriptor: 8, // Непонятно зачем, но в реальных файлах встречается.
    });
    expect(info.size.toString()).toBe("(400, 300)");
    expect(info.fmt.signature).toBe("G8");
    expect(options).toEqual({
      compression: false,
      top2bottom: false,
      right2left: false,
      orgX: 0,
      orgY: 10,
    });
  });

  it("rleColorMapped", () => {
    const { info, options } = targaHeaderAnalyze({
      idLength: 0,
      colorMapType: 0,
      imageType: TargaImageType.rleColorMapped,
      colorMapStart: 0,
      colorMapLength: 16,
      colorItemSize: 0,
      x0: 0,
      y0: 0,
      width: 48,
      height: 32,
      depth: 8,
      imageDescriptor: 0,
    });
    expect(info.size.toString()).toBe("(48, 32)");
    expect(info.fmt.signature).toBe("I8");
    expect(options).toEqual({
      compression: true,
      top2bottom: false,
      right2left: false,
    });
  });

  it("rleTrueColor", () => {
    const { info, options } = targaHeaderAnalyze({
      idLength: 0,
      colorMapType: 0,
      imageType: TargaImageType.rleTrueColor,
      colorMapStart: 0,
      colorMapLength: 16,
      colorItemSize: 0,
      x0: 0,
      y0: 0,
      width: 100,
      height: 500,
      depth: 32,
      imageDescriptor: 8,
    });
    expect(info.size.toString()).toBe("(100, 500)");
    expect(info.fmt.signature).toBe("B8G8R8A8");
    expect(options).toEqual({
      compression: true,
      top2bottom: false,
      right2left: false,
    });
  });
});
