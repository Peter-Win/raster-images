import { Sample, SampleSign } from "../Sample";
import { PixelFormatDef } from "./PixelFormatDef";

const stdSamples = (length: number, signs: SampleSign[]): Sample[] =>
  signs.map((sign, i) => ({ sign, length, shift: i * length }));

export const analysePixelFormatDef = (
  srcDef: PixelFormatDef
): [PixelFormatDef, Sample[]] => {
  let samples: Sample[] = [];
  const { palette, depth } = srcDef;
  let { alpha, colorModel } = srcDef;
  let bErr = false;
  if (colorModel === "Auto") {
    if (palette) colorModel = "Indexed";
    else if (depth <= 8) colorModel = "Gray";
    else colorModel = "RGB";
  }
  if (colorModel === "RGB") {
    const mkSamples = (
      r: number,
      g: number,
      b: number,
      a?: number
    ): Sample[] => {
      const res: Sample[] = [
        { shift: 0, length: b, sign: "B" },
        { shift: b, length: g, sign: "G" },
        { shift: b + g, length: r, sign: "R" },
      ];
      if (a) res.push({ shift: b + g + r, length: a, sign: alpha ? "A" : "X" });
      return res;
    };
    if (depth === 24 && !alpha) {
      samples = mkSamples(8, 8, 8); // B8G8R8
    } else if (depth === 32) {
      alpha = alpha !== false;
      samples = mkSamples(8, 8, 8, 8); // B8G8R8A8 | B8G8R8X8
    } else if (depth === 16) {
      // B5G5R5A1 | B5G6R5
      samples = alpha ? mkSamples(5, 5, 5, 1) : mkSamples(5, 6, 5);
    } else if (depth === 15 && alpha !== true) {
      samples = mkSamples(5, 5, 5);
    } else if (depth === 48 && alpha !== true) {
      samples = mkSamples(16, 16, 16); // B16G16R16
    } else if (depth === 64 && alpha !== false) {
      samples = mkSamples(16, 16, 16, 16); // B16G16R16A16
    } else if (depth === 96 && alpha !== true) {
      samples = mkSamples(32, 32, 32);
    } else if (depth === 128 && alpha !== false) {
      samples = mkSamples(32, 32, 32, 32);
    } else bErr = true;
    alpha = alpha ?? samples.length === 4;
  } else if (colorModel === "Gray") {
    const gSamples = (g: number, a?: number) => {
      samples.push({ sign: "G", shift: 0, length: g });
      if (a) samples.push({ sign: "A", shift: g, length: a });
    };
    if (
      (depth === 8 || depth === 4 || depth === 2 || depth === 1) &&
      alpha !== true
    ) {
      gSamples(depth);
    } else if (depth === 16) {
      if (alpha === true) gSamples(8, 8);
      else gSamples(16);
    } else if (depth === 32) {
      if (alpha !== false) gSamples(16, 16);
      else gSamples(depth);
    } else if (depth === 64 && alpha !== false) {
      gSamples(32, 32);
    } else bErr = true;
    alpha = alpha ?? samples.length === 2;
  } else if (colorModel === "Indexed") {
    alpha = !!alpha;
    samples.push({ sign: alpha ? "J" : "I", shift: 0, length: depth });
  } else if (colorModel === "CMYK") {
    if (depth === 32 && alpha !== true) {
      alpha = false;
      samples = stdSamples(8, ["C", "M", "Y", "K"]);
    } else if (depth === 40 && alpha !== false) {
      alpha = true;
      samples = stdSamples(8, ["C", "M", "Y", "K", "A"]);
    } else if (depth === 64 && alpha !== true) {
      alpha = false;
      samples = stdSamples(16, ["C", "M", "Y", "K"]);
    } else if (depth === 80 && alpha !== false) {
      alpha = true;
      samples = stdSamples(16, ["C", "M", "Y", "K", "A"]);
    } else bErr = true;
  }
  if (bErr) {
    throw Error(
      `Invalid pixel format: ${depth} bit/pixel, ${colorModel}${
        alpha ? "+Alpha" : ""
      }`
    );
  }
  return [{ depth, colorModel, alpha, palette }, samples];
};
