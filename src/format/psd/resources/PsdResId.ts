/**
 * @see https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/#50577409_pgfId-1054855
 */
export const enum PsdResId {
  resolutionInfo = 0x03ed,
  printFlags = 0x03f3, // A series of one-byte boolean values (see Page Setup dialog): labels, crop marks, color bars, registration marks, negative, flip, interpolate, caption, print flags.
  layerStateInfo = 0x0400, // Layer state information. 2 bytes containing the index of target layer (0 = bottom layer).
  layersGroupInfo = 0x0402, // Layers group information. 2 bytes per layer containing a group ID for the dragging groups. Layers in a group have the same group ID.
  iptcNaa = 0x404,
  gridAndGuides = 0x0408, // (Photoshop 4.0) Grid and guides information.
  thumbnail = 0x040c, // (Photoshop 5.0) Thumbnail resource
  globalAngle = 0x040d, // (Photoshop 5.0) Global Angle. 4 bytes that contain an integer between 0 and 359, which is the global lighting angle for effects layer. If not present, assumed to be 30.
  iccProfile = 0x040f, // (Photoshop 5.0) ICC Profile. The raw bytes of an ICC (International Color Consortium) format profile. See ICC1v42_2006-05.pdf
  idSeedNumber = 0x0414, // (Photoshop 5.0) Document-specific IDs seed number. 4 bytes: Base value, starting at which layer IDs will be generated
  globalAltitude = 0x0419, // (Photoshop 6.0) Global Altitude. 4 byte entry for altitude
  slices = 0x041a, // (Photoshop 6.0) Slices.
  exif1 = 0x0422,
  exif3 = 0x0423,
  xmp = 0x0424, // (Photoshop 7.0) XMP metadata. File info as XML description. See http://www.adobe.com/devnet/xmp/
  printScale = 0x0426, // see PsdPrintScale.ts
  layerSelectionIds = 0x042d, // (Photoshop CS2) Layer Selection ID(s). 2 bytes count, following is repeated for each count: 4 bytes layer ID
}
