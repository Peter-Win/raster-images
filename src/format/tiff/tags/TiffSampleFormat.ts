export const enum TiffSampleFormat {
  unsignedInteger = 1,
  signedInteger = 2,
  floatingPoint = 3,
  undefined = 4,
}

export const tiffSampleFormatName: Record<TiffSampleFormat, string> = {
  [TiffSampleFormat.unsignedInteger]: "unsigned integer",
  [TiffSampleFormat.signedInteger]: "signed integer",
  [TiffSampleFormat.floatingPoint]: "floating point",
  [TiffSampleFormat.undefined]: "undefined",
};
