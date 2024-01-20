export enum TiffTag {
  Artist = 0x13b, // ASCII
  BitsPerSample = 0x102,
  CellLength = 0x109,
  CellWidth = 0x108,
  ColorMap = 0x140,
  Compression = 0x103, // see TiffCompression
  Copyright = 0x8298, // ASCII
  DateTime = 0x132, // Date and time of image creation. ASCII. “YYYY:MM:DD HH:MM:SS”
  ExtraSamples = 0x152, //
  FillOrder = 0x10a,
  FreeByteCounts = 0x121,
  FreeOffsets = 0x120,
  GrayResponseCurve = 0x123,
  GrayResponseUnit = 0x122,
  HostComputer = 0x13c, // ASCII
  ImageDescription = 0x10e, // ASCII
  ImageLength = 0x101, // height
  ImageWidth = 0x100,
  Make = 0x10f, // ASCII
  MaxSampleValue = 0x119, // Default is 2**(BitsPerSample) - 1
  MinSampleValue = 0x118,
  Model = 0x110, // ASCII
  NewSubfileType = 0x0fe, // LONG
  Orientation = 0x112, // SHORT
  PhotometricInterpretation = 0x106, // SHORT. 0 = WhiteIsZero, 1 = BlackIsZero, 2=RGB, 3= Palette color, ...
  PlanarConfiguration = 0x11c, // 1 = Chunky format. 2 = Planar format
  Predictor = 0x13d,
  ResolutionUnit = 0x128, // 1 = No absolute unit of measurement.  2 = Inch, 3 = Centimeter.
  RowsPerStrip = 0x116,
  SampleFormat = 0x153,
  SMinSampleValue = 0x154,
  SMaxSampleValue = 0x155,
  SamplesPerPixel = 0x115,
  Software = 0x131, // ASCII
  StripByteCounts = 0x117,
  StripOffsets = 0x111,
  SubfileType = 0x0ff,
  Threshholding = 0x107,
  XResolution = 0x11a,
  YResolution = 0x11b,

  TileWidth = 0x142,
  TileLength = 0x143,
  TileOffsets = 0x144,
  TileByteCounts = 0x145,

  // Section 12: Document Storage and Retrieval
  DocumentName = 0x10d,
  PageName = 0x11d,
  PageNumber = 0x129,
  XPosition = 0x11e, // offset in ResolutionUnits
  YPosition = 0x11f,

  // Colorimetry Field Definitions
  WhitePoint = 0x13e,
  PrimaryChromaticities = 0x13f,
  TransferFunction = 0x12d,
  TransferRange = 0x156,
  ReferenceBlackWhite = 0x214,

  // JPEG
  JPEGProc = 0x200, // 1= Baseline sequential process, 14= Lossless process with Huffman coding
  JPEGInterchangeFormat = 0x201,
  JPEGInterchangeFormatLength = 0x202,
  JPEGRestartInterval = 0x203,
  JPEGLosslessPredictors = 0x205,
  JPEGPointTransforms = 0x206,
  JPEGQTables = 0x207,
  JPEGDCTables = 0x208,
  JPEGACTables = 0x209,

  YCbCrCoefficients = 0x211,
  YCbCrSubSampling = 0x212,
  YCbCrPositioning = 0x213,

  T4Options = 0x124,
  T6Options = 0x125,
}

export const tiffTagName: Record<TiffTag, string> = {
  [TiffTag.Artist]: "Artist",
  [TiffTag.BitsPerSample]: "BitsPerSample",
  [TiffTag.CellLength]: "CellLength",
  [TiffTag.CellWidth]: "CellWidth",
  [TiffTag.ColorMap]: "ColorMap",
  [TiffTag.Compression]: "Compression",
  [TiffTag.Copyright]: "Copyright",
  [TiffTag.DateTime]: "DateTime",
  [TiffTag.ExtraSamples]: "ExtraSamples",
  [TiffTag.FillOrder]: "FillOrder",
  [TiffTag.FreeByteCounts]: "FreeByteCounts",
  [TiffTag.FreeOffsets]: "FreeOffsets",
  [TiffTag.GrayResponseCurve]: "GrayResponseCurve",
  [TiffTag.GrayResponseUnit]: "GrayResponseUnit",
  [TiffTag.HostComputer]: "HostComputer",
  [TiffTag.ImageDescription]: "ImageDescription",
  [TiffTag.ImageLength]: "ImageLength",
  [TiffTag.ImageWidth]: "ImageWidth",
  [TiffTag.Make]: "Make",
  [TiffTag.MaxSampleValue]: "MaxSampleValue",
  [TiffTag.MinSampleValue]: "MinSampleValue",
  [TiffTag.Model]: "Model",
  [TiffTag.NewSubfileType]: "NewSubfileType",
  [TiffTag.Orientation]: "Orientation",
  [TiffTag.PhotometricInterpretation]: "PhotometricInterpretation",
  [TiffTag.PlanarConfiguration]: "PlanarConfiguration",
  [TiffTag.Predictor]: "Predictor",
  [TiffTag.ResolutionUnit]: "ResolutionUnit",
  [TiffTag.RowsPerStrip]: "RowsPerStrip",
  [TiffTag.SampleFormat]: "SampleFormat",
  [TiffTag.SMinSampleValue]: "SMinSampleValue",
  [TiffTag.SMaxSampleValue]: "SMaxSampleValue",
  [TiffTag.SamplesPerPixel]: "SamplesPerPixel",
  [TiffTag.Software]: "Software",
  [TiffTag.StripByteCounts]: "StripByteCounts",
  [TiffTag.StripOffsets]: "StripOffsets",
  [TiffTag.SubfileType]: "SubfileType",
  [TiffTag.Threshholding]: "Threshholding",
  [TiffTag.XResolution]: "XResolution",
  [TiffTag.YResolution]: "YResolution",

  [TiffTag.DocumentName]: "DocumentName",
  [TiffTag.PageName]: "PageName",
  [TiffTag.PageNumber]: "PageNumber",
  [TiffTag.XPosition]: "XPosition",
  [TiffTag.YPosition]: "YPosition",

  [TiffTag.TileWidth]: "TileWidth",
  [TiffTag.TileLength]: "TileLength",
  [TiffTag.TileOffsets]: "TileOffsets",
  [TiffTag.TileByteCounts]: "TileByteCounts",

  [TiffTag.WhitePoint]: "WhitePoint",
  [TiffTag.PrimaryChromaticities]: "PrimaryChromaticities",
  [TiffTag.TransferFunction]: "TransferFunction",
  [TiffTag.TransferRange]: "TransferRange",
  [TiffTag.ReferenceBlackWhite]: "ReferenceBlackWhite",

  [TiffTag.JPEGProc]: "JPEGProc",
  [TiffTag.JPEGInterchangeFormat]: "JPEGInterchangeFormat",
  [TiffTag.JPEGInterchangeFormatLength]: "JPEGInterchangeFormatLength",
  [TiffTag.JPEGRestartInterval]: "JPEGRestartInterval",
  [TiffTag.JPEGLosslessPredictors]: "JPEGLosslessPredictors",
  [TiffTag.JPEGPointTransforms]: "JPEGPointTransforms",
  [TiffTag.JPEGQTables]: "JPEGQTables",
  [TiffTag.JPEGDCTables]: "JPEGDCTables",
  [TiffTag.JPEGACTables]: "JPEGACTables",

  [TiffTag.YCbCrCoefficients]: "YCbCrCoefficients",
  [TiffTag.YCbCrSubSampling]: "YCbCrSubSampling",
  [TiffTag.YCbCrPositioning]: "YCbCrPositioning",

  [TiffTag.T4Options]: "T4Options",
  [TiffTag.T6Options]: "T6Options",
};
