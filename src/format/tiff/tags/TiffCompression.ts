export const enum TiffCompression {
  None = 1,
  CcittHuffman = 2,
  Group3Fax = 3, // T4Options
  Group4Fax = 4, // T6Options
  LZW = 5,
  JPEG = 6,
  ZIP = 8,
  PackBits = 32773,
}

export interface TiffCompressionDef {
  name: string;
}

export const tiffCompressionDict: Record<TiffCompression, TiffCompressionDef> =
  {
    [TiffCompression.None]: {
      name: "None",
    },
    [TiffCompression.CcittHuffman]: {
      name: "CCITT Huffman",
    },
    [TiffCompression.Group3Fax]: {
      name: "Group3Fax",
    },
    [TiffCompression.Group4Fax]: {
      name: "Group4Fax",
    },
    [TiffCompression.LZW]: {
      name: "LZW",
    },
    [TiffCompression.JPEG]: {
      name: "JPEG",
    },
    [TiffCompression.ZIP]: {
      name: "ZIP",
    },
    [TiffCompression.PackBits]: {
      name: "PackBits",
    },
  };
