export const enum PsdCompression {
  None = 0,
  RLE = 1,
  Zip = 2,
  ZipPrediction = 3,
}

export const psdCompressionName: Record<PsdCompression, string> = {
  [PsdCompression.None]: "None",
  [PsdCompression.RLE]: "RLE",
  [PsdCompression.Zip]: "ZIP",
  [PsdCompression.ZipPrediction]: "ZIP with prediction",
};
