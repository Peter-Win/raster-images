import { defFromSamples } from "../defFromSamples";
import { parseSignature } from "../parseSignature";

test("defFromSamples", () => {
  expect(defFromSamples(parseSignature("B5G5R5"))).toEqual({
    depth: 15,
    colorModel: "RGB",
    alpha: false,
  });
  expect(defFromSamples(parseSignature("B5G5R5A1"))).toEqual({
    depth: 16,
    colorModel: "RGB",
    alpha: true,
  });
  expect(defFromSamples(parseSignature("B5G6R5"))).toEqual({
    depth: 16,
    colorModel: "RGB",
    alpha: false,
  });
  expect(defFromSamples(parseSignature("R4G4B4A4"))).toEqual({
    depth: 16,
    colorModel: "RGB",
    alpha: true,
  });
  expect(defFromSamples(parseSignature("R8G8B8"))).toEqual({
    depth: 24,
    colorModel: "RGB",
    alpha: false,
  });
  expect(defFromSamples(parseSignature("B8G8R8A8"))).toEqual({
    depth: 32,
    colorModel: "RGB",
    alpha: true,
  });
  expect(defFromSamples(parseSignature("B8G8R8X8"))).toEqual({
    depth: 32,
    colorModel: "RGB",
    alpha: false,
  });
  expect(defFromSamples(parseSignature("B16G16R16"))).toEqual({
    depth: 48,
    colorModel: "RGB",
    alpha: false,
  });
  expect(defFromSamples(parseSignature("B16G16R16A16"))).toEqual({
    depth: 64,
    colorModel: "RGB",
    alpha: true,
  });
  expect(defFromSamples(parseSignature("G1"))).toEqual({
    depth: 1,
    colorModel: "Gray",
    alpha: false,
  });
  expect(defFromSamples(parseSignature("G2"))).toEqual({
    depth: 2,
    colorModel: "Gray",
    alpha: false,
  });
  expect(defFromSamples(parseSignature("G4"))).toEqual({
    depth: 4,
    colorModel: "Gray",
    alpha: false,
  });
  expect(defFromSamples(parseSignature("G8"))).toEqual({
    depth: 8,
    colorModel: "Gray",
    alpha: false,
  });
  expect(defFromSamples(parseSignature("G8A8"))).toEqual({
    depth: 16,
    colorModel: "Gray",
    alpha: true,
  });
  expect(defFromSamples(parseSignature("G16"))).toEqual({
    depth: 16,
    colorModel: "Gray",
    alpha: false,
  });
  expect(defFromSamples(parseSignature("G16A16"))).toEqual({
    depth: 32,
    colorModel: "Gray",
    alpha: true,
  });
  expect(defFromSamples(parseSignature("G32"))).toEqual({
    depth: 32,
    colorModel: "Gray",
    alpha: false,
  });
  expect(defFromSamples(parseSignature("G32A32"))).toEqual({
    depth: 64,
    colorModel: "Gray",
    alpha: true,
  });
  expect(defFromSamples(parseSignature("I8"))).toEqual({
    depth: 8,
    colorModel: "Indexed",
    alpha: false,
  });
  expect(defFromSamples(parseSignature("J8"))).toEqual({
    depth: 8,
    colorModel: "Indexed",
    alpha: true,
  });
  expect(defFromSamples(parseSignature("C8M8Y8K8"))).toEqual({
    depth: 32,
    colorModel: "CMYK",
    alpha: false,
  });
  expect(defFromSamples(parseSignature("C8M8Y8K8A8"))).toEqual({
    depth: 40,
    colorModel: "CMYK",
    alpha: true,
  });
});
