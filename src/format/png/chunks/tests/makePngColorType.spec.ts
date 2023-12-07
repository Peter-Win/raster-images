import { PixelFormat } from "../../../../PixelFormat";
import { PngColorType, makePngColorType } from "../PngHeader";

test("makePngColorType", () => {
  expect(makePngColorType(new PixelFormat("I1"))).toBe(PngColorType.indexed);
  expect(makePngColorType(new PixelFormat("I4"))).toBe(PngColorType.indexed);
  expect(makePngColorType(new PixelFormat("I8"))).toBe(PngColorType.indexed);

  expect(makePngColorType(new PixelFormat("G1"))).toBe(PngColorType.grayscale);
  expect(makePngColorType(new PixelFormat("G4"))).toBe(PngColorType.grayscale);
  expect(makePngColorType(new PixelFormat("G8"))).toBe(PngColorType.grayscale);
  expect(makePngColorType(new PixelFormat("G16"))).toBe(PngColorType.grayscale);

  expect(makePngColorType(new PixelFormat("G8A8"))).toBe(
    PngColorType.grayscaleAlpha
  );
  expect(makePngColorType(new PixelFormat("G16A16"))).toBe(
    PngColorType.grayscaleAlpha
  );

  expect(makePngColorType(new PixelFormat("R8G8B8"))).toBe(
    PngColorType.truecolor
  );
  expect(makePngColorType(new PixelFormat("R16G16B16"))).toBe(
    PngColorType.truecolor
  );

  expect(makePngColorType(new PixelFormat("R8G8B8A8"))).toBe(
    PngColorType.truecolorAlpha
  );
  expect(makePngColorType(new PixelFormat("R16G16B16A16"))).toBe(
    PngColorType.truecolorAlpha
  );
});
