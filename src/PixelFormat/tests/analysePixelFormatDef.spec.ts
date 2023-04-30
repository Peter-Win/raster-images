import { analysePixelFormatDef } from "../analysePixelFormatDef";

describe("analysePixelFormatDef", () => {
  it("B8G8R8", () => {
    expect(analysePixelFormatDef({ depth: 24, colorModel: "RGB" })).toEqual([
      { depth: 24, colorModel: "RGB", alpha: false },
      [
        { sign: "B", shift: 0, length: 8 },
        { sign: "G", shift: 8, length: 8 },
        { sign: "R", shift: 16, length: 8 },
      ],
    ]);
  });
  it("B8G8R8X8", () => {
    expect(
      analysePixelFormatDef({ depth: 32, colorModel: "RGB", alpha: false })
    ).toEqual([
      { depth: 32, colorModel: "RGB", alpha: false },
      [
        { sign: "B", shift: 0, length: 8 },
        { sign: "G", shift: 8, length: 8 },
        { sign: "R", shift: 16, length: 8 },
        { sign: "X", shift: 24, length: 8 },
      ],
    ]);
  });
  it("B8G8R8A8", () => {
    expect(
      analysePixelFormatDef({ depth: 32, colorModel: "RGB", alpha: true })
    ).toEqual([
      { depth: 32, colorModel: "RGB", alpha: true },
      [
        { sign: "B", shift: 0, length: 8 },
        { sign: "G", shift: 8, length: 8 },
        { sign: "R", shift: 16, length: 8 },
        { sign: "A", shift: 24, length: 8 },
      ],
    ]);
  });
  it("B5G5R5", () => {
    expect(
      analysePixelFormatDef({ depth: 15, colorModel: "RGB", alpha: false })
    ).toEqual([
      { depth: 15, colorModel: "RGB", alpha: false },
      [
        { sign: "B", shift: 0, length: 5 },
        { sign: "G", shift: 5, length: 5 },
        { sign: "R", shift: 10, length: 5 },
      ],
    ]);
  });
  it("B5G6R5", () => {
    expect(
      analysePixelFormatDef({ depth: 16, colorModel: "RGB", alpha: false })
    ).toEqual([
      { depth: 16, colorModel: "RGB", alpha: false },
      [
        { sign: "B", shift: 0, length: 5 },
        { sign: "G", shift: 5, length: 6 },
        { sign: "R", shift: 11, length: 5 },
      ],
    ]);
  });
  it("B5G5R5A1", () => {
    expect(
      analysePixelFormatDef({ depth: 16, colorModel: "RGB", alpha: true })
    ).toEqual([
      { depth: 16, colorModel: "RGB", alpha: true },
      [
        { sign: "B", shift: 0, length: 5 },
        { sign: "G", shift: 5, length: 5 },
        { sign: "R", shift: 10, length: 5 },
        { sign: "A", shift: 15, length: 1 },
      ],
    ]);
  });
  it("B16G16R16", () => {
    expect(analysePixelFormatDef({ depth: 48, colorModel: "RGB" })).toEqual([
      { depth: 48, colorModel: "RGB", alpha: false },
      [
        { sign: "B", shift: 0, length: 16 },
        { sign: "G", shift: 16, length: 16 },
        { sign: "R", shift: 32, length: 16 },
      ],
    ]);
  });
  it("B16G16R16A16", () => {
    expect(
      analysePixelFormatDef({ depth: 64, colorModel: "RGB", alpha: true })
    ).toEqual([
      { depth: 64, colorModel: "RGB", alpha: true },
      [
        { sign: "B", shift: 0, length: 16 },
        { sign: "G", shift: 16, length: 16 },
        { sign: "R", shift: 32, length: 16 },
        { sign: "A", shift: 48, length: 16 },
      ],
    ]);
  });
  it("B32G32R32", () => {
    expect(
      analysePixelFormatDef({ depth: 96, colorModel: "RGB", alpha: false })
    ).toEqual([
      { depth: 96, colorModel: "RGB", alpha: false },
      [
        { sign: "B", shift: 0, length: 32 },
        { sign: "G", shift: 32, length: 32 },
        { sign: "R", shift: 64, length: 32 },
      ],
    ]);
  });
  it("B32G32R32A32", () => {
    expect(
      analysePixelFormatDef({ depth: 128, colorModel: "RGB", alpha: true })
    ).toEqual([
      { depth: 128, colorModel: "RGB", alpha: true },
      [
        { sign: "B", shift: 0, length: 32 },
        { sign: "G", shift: 32, length: 32 },
        { sign: "R", shift: 64, length: 32 },
        { sign: "A", shift: 96, length: 32 },
      ],
    ]);
  });
  it("G1", () => {
    expect(
      analysePixelFormatDef({ depth: 1, colorModel: "Gray", alpha: false })
    ).toEqual([
      { depth: 1, colorModel: "Gray", alpha: false },
      [{ sign: "G", shift: 0, length: 1 }],
    ]);
  });
  it("G2", () => {
    expect(
      analysePixelFormatDef({ depth: 2, colorModel: "Gray", alpha: false })
    ).toEqual([
      { depth: 2, colorModel: "Gray", alpha: false },
      [{ sign: "G", shift: 0, length: 2 }],
    ]);
  });
  it("G4", () => {
    expect(
      analysePixelFormatDef({ depth: 4, colorModel: "Gray", alpha: false })
    ).toEqual([
      { depth: 4, colorModel: "Gray", alpha: false },
      [{ sign: "G", shift: 0, length: 4 }],
    ]);
  });
  it("G8", () => {
    expect(
      analysePixelFormatDef({ depth: 8, colorModel: "Gray", alpha: false })
    ).toEqual([
      { depth: 8, colorModel: "Gray", alpha: false },
      [{ sign: "G", shift: 0, length: 8 }],
    ]);
  });
  it("G8A8", () => {
    expect(
      analysePixelFormatDef({ depth: 16, colorModel: "Gray", alpha: true })
    ).toEqual([
      { depth: 16, colorModel: "Gray", alpha: true },
      [
        { sign: "G", shift: 0, length: 8 },
        { sign: "A", shift: 8, length: 8 },
      ],
    ]);
  });
  it("G16", () => {
    expect(
      analysePixelFormatDef({ depth: 16, colorModel: "Gray", alpha: false })
    ).toEqual([
      { depth: 16, colorModel: "Gray", alpha: false },
      [{ sign: "G", shift: 0, length: 16 }],
    ]);
  });
  it("G16A16", () => {
    expect(
      analysePixelFormatDef({ depth: 32, colorModel: "Gray", alpha: true })
    ).toEqual([
      { depth: 32, colorModel: "Gray", alpha: true },
      [
        { sign: "G", shift: 0, length: 16 },
        { sign: "A", shift: 16, length: 16 },
      ],
    ]);
  });
  it("G32", () => {
    expect(
      analysePixelFormatDef({ depth: 32, colorModel: "Gray", alpha: false })
    ).toEqual([
      { depth: 32, colorModel: "Gray", alpha: false },
      [{ sign: "G", shift: 0, length: 32 }],
    ]);
  });
  it("G32A32", () => {
    expect(
      analysePixelFormatDef({ depth: 64, colorModel: "Gray", alpha: true })
    ).toEqual([
      { depth: 64, colorModel: "Gray", alpha: true },
      [
        { sign: "G", shift: 0, length: 32 },
        { sign: "A", shift: 32, length: 32 },
      ],
    ]);
  });
  it("I8", () => {
    expect(
      analysePixelFormatDef({ depth: 8, colorModel: "Indexed", alpha: false })
    ).toEqual([
      { depth: 8, colorModel: "Indexed", alpha: false },
      [{ sign: "I", shift: 0, length: 8 }],
    ]);
  });
  it("J8", () => {
    expect(
      analysePixelFormatDef({ depth: 8, colorModel: "Indexed", alpha: true })
    ).toEqual([
      { depth: 8, colorModel: "Indexed", alpha: true },
      [{ sign: "J", shift: 0, length: 8 }],
    ]);
  });
  it("C8M8Y8K8", () => {
    expect(analysePixelFormatDef({ depth: 32, colorModel: "CMYK" })).toEqual([
      { depth: 32, colorModel: "CMYK", alpha: false },
      [
        { sign: "C", shift: 0, length: 8 },
        { sign: "M", shift: 8, length: 8 },
        { sign: "Y", shift: 16, length: 8 },
        { sign: "K", shift: 24, length: 8 },
      ],
    ]);
  });
  it("C8M8Y8K8A8", () => {
    expect(analysePixelFormatDef({ depth: 40, colorModel: "CMYK" })).toEqual([
      { depth: 40, colorModel: "CMYK", alpha: true },
      [
        { sign: "C", shift: 0, length: 8 },
        { sign: "M", shift: 8, length: 8 },
        { sign: "Y", shift: 16, length: 8 },
        { sign: "K", shift: 24, length: 8 },
        { sign: "A", shift: 32, length: 8 },
      ],
    ]);
  });

  it("Auto detect", () => {
    expect(analysePixelFormatDef({ depth: 1, colorModel: "Auto" })[0]).toEqual({
      depth: 1,
      colorModel: "Gray",
      alpha: false,
    });
    expect(analysePixelFormatDef({ depth: 2, colorModel: "Auto" })[0]).toEqual({
      depth: 2,
      colorModel: "Gray",
      alpha: false,
    });
    expect(analysePixelFormatDef({ depth: 4, colorModel: "Auto" })[0]).toEqual({
      depth: 4,
      colorModel: "Gray",
      alpha: false,
    });
    expect(analysePixelFormatDef({ depth: 8, colorModel: "Auto" })[0]).toEqual({
      depth: 8,
      colorModel: "Gray",
      alpha: false,
    });
    expect(analysePixelFormatDef({ depth: 15, colorModel: "Auto" })[0]).toEqual(
      { depth: 15, colorModel: "RGB", alpha: false }
    );
    expect(analysePixelFormatDef({ depth: 16, colorModel: "Auto" })[0]).toEqual(
      { depth: 16, colorModel: "RGB", alpha: false }
    );
    expect(analysePixelFormatDef({ depth: 24, colorModel: "Auto" })[0]).toEqual(
      { depth: 24, colorModel: "RGB", alpha: false }
    );
    expect(analysePixelFormatDef({ depth: 32, colorModel: "Auto" })[0]).toEqual(
      { depth: 32, colorModel: "RGB", alpha: true }
    );
    expect(analysePixelFormatDef({ depth: 48, colorModel: "Auto" })[0]).toEqual(
      { depth: 48, colorModel: "RGB", alpha: false }
    );
    expect(analysePixelFormatDef({ depth: 64, colorModel: "Auto" })[0]).toEqual(
      { depth: 64, colorModel: "RGB", alpha: true }
    );
    expect(analysePixelFormatDef({ depth: 96, colorModel: "Auto" })[0]).toEqual(
      { depth: 96, colorModel: "RGB", alpha: false }
    );
    expect(
      analysePixelFormatDef({ depth: 128, colorModel: "Auto" })[0]
    ).toEqual({ depth: 128, colorModel: "RGB", alpha: true });
    expect(analysePixelFormatDef({ depth: 16, colorModel: "Gray" })[0]).toEqual(
      { depth: 16, colorModel: "Gray", alpha: false }
    );
    expect(analysePixelFormatDef({ depth: 32, colorModel: "Gray" })[0]).toEqual(
      { depth: 32, colorModel: "Gray", alpha: true }
    );
    expect(analysePixelFormatDef({ depth: 64, colorModel: "Gray" })[0]).toEqual(
      { depth: 64, colorModel: "Gray", alpha: true }
    );
    expect(
      analysePixelFormatDef({ depth: 8, colorModel: "Auto", palette: [] })[0]
    ).toEqual({ depth: 8, colorModel: "Indexed", alpha: false, palette: [] });
  });
  it("Wrong parameters", () => {
    expect(() =>
      analysePixelFormatDef({ depth: 8, colorModel: "RGB" })
    ).toThrowError("Invalid pixel format: 8 bit/pixel, RGB");
    expect(() =>
      analysePixelFormatDef({ depth: 15, colorModel: "RGB", alpha: true })
    ).toThrowError("Invalid pixel format: 15 bit/pixel, RGB+Alpha");
    expect(() =>
      analysePixelFormatDef({ depth: 24, colorModel: "RGB", alpha: true })
    ).toThrowError("Invalid pixel format: 24 bit/pixel, RGB+Alpha");
    expect(() =>
      analysePixelFormatDef({ depth: 48, colorModel: "RGB", alpha: true })
    ).toThrowError("Invalid pixel format: 48 bit/pixel, RGB+Alpha");
    expect(() =>
      analysePixelFormatDef({ depth: 64, colorModel: "RGB", alpha: false })
    ).toThrowError("Invalid pixel format: 64 bit/pixel, RGB");
    expect(() =>
      analysePixelFormatDef({ depth: 96, colorModel: "RGB", alpha: true })
    ).toThrowError("Invalid pixel format: 96 bit/pixel, RGB+Alpha");
    expect(() =>
      analysePixelFormatDef({ depth: 128, colorModel: "RGB", alpha: false })
    ).toThrowError("Invalid pixel format: 128 bit/pixel, RGB");
    expect(() =>
      analysePixelFormatDef({ depth: 1, colorModel: "Auto", alpha: true })
    ).toThrowError("Invalid pixel format: 1 bit/pixel, Gray+Alpha");
    expect(() =>
      analysePixelFormatDef({ depth: 2, colorModel: "Gray", alpha: true })
    ).toThrowError("Invalid pixel format: 2 bit/pixel, Gray+Alpha");
    expect(() =>
      analysePixelFormatDef({ depth: 4, colorModel: "Auto", alpha: true })
    ).toThrowError("Invalid pixel format: 4 bit/pixel, Gray+Alpha");
    expect(() =>
      analysePixelFormatDef({ depth: 8, colorModel: "Gray", alpha: true })
    ).toThrowError("Invalid pixel format: 8 bit/pixel, Gray+Alpha");
    expect(() =>
      analysePixelFormatDef({ depth: 64, colorModel: "Gray", alpha: false })
    ).toThrowError("Invalid pixel format: 64 bit/pixel, Gray");
  });
});
