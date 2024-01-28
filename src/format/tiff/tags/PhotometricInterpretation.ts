import { ColorModel } from "../../../ColorModel";

export const enum PhotometricInterpretation {
  WhiteIsZero = 0,
  BlackIsZero = 1,
  RGB = 2,
  PaletteColor = 3,
  TransparencyMask = 4,
  CMYK = 5,
  YCbCr = 6,
  LogL = 32844,
  LogLuv = 32845, // http://www.anyhere.com/gward/pixformat/tiffluv.html
}

export const photoIntNames: Record<PhotometricInterpretation, string> = {
  [PhotometricInterpretation.WhiteIsZero]: "WhiteIsZero",
  [PhotometricInterpretation.BlackIsZero]: "BlackIsZero",
  [PhotometricInterpretation.RGB]: "RGB",
  [PhotometricInterpretation.PaletteColor]: "Palette color",
  [PhotometricInterpretation.TransparencyMask]: "Transparency Mask",
  [PhotometricInterpretation.CMYK]: "CMYK",
  [PhotometricInterpretation.YCbCr]: "YCbCr",
  [PhotometricInterpretation.LogL]: "CIE Log2(L)",
  [PhotometricInterpretation.LogLuv]: "CIE Log2(L) (u',v')",
};

export const photoIntToColorModel: Record<
  PhotometricInterpretation,
  ColorModel
> = {
  [PhotometricInterpretation.WhiteIsZero]: "Gray",
  [PhotometricInterpretation.BlackIsZero]: "Gray",
  [PhotometricInterpretation.RGB]: "RGB",
  [PhotometricInterpretation.PaletteColor]: "Indexed",
  [PhotometricInterpretation.TransparencyMask]: "Gray",
  [PhotometricInterpretation.CMYK]: "CMYK",
  [PhotometricInterpretation.YCbCr]: "YCbCr",
  [PhotometricInterpretation.LogL]: "Unknown",
  [PhotometricInterpretation.LogLuv]: "Unknown",
};
