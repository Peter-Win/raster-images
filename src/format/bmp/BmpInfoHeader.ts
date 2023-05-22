// https://learn.microsoft.com/en-us/windows/win32/api/wingdi/ns-wingdi-bitmapinfoheader
// +0  4  DWORD biSize;
const ofsSize = 0;
// +4  4  LONG  biWidth;
const ofsWidth = ofsSize + 4;
// +8  4  LONG  biHeight;
const ofsHeight = ofsWidth + 4;
// +12 2  WORD  biPlanes;
const ofsPlanes = ofsHeight + 4;
// +14 2  WORD  biBitCount;
const ofsBitCount = ofsPlanes + 2;
// +16 4  DWORD biCompression;
const ofsCompression = ofsBitCount + 2;
// +20 4  DWORD biSizeImage;
const ofsSizeImage = ofsCompression + 4;
// +24 4  LONG  biXPelsPerMeter;
const ofsXPelsPerMeter = ofsSizeImage + 4;
// +28 4  LONG  biYPelsPerMeter;
const ofsYPelsPerMeter = ofsXPelsPerMeter + 4;
// +32 4  DWORD biClrUsed;
const ofsClrUsed = ofsYPelsPerMeter + 4;
// +36 4  DWORD biClrImportant;
const ofsClrImportant = ofsClrUsed + 4;

export const bmpInfoHeaderSize = ofsClrImportant + 4;

export const enum BmpCompression {
  RGB = 0,
  RLE8 = 1,
  RLE4 = 2,
  BITFIELDS = 3,
  JPEG = 4,
  PNG = 5,
}

const compressionNames: Record<BmpCompression, string> = {
  [BmpCompression.RGB]: "RGB",
  [BmpCompression.RLE8]: "RLE8",
  [BmpCompression.RLE4]: "RLE4",
  [BmpCompression.BITFIELDS]: "BITFIELDS",
  [BmpCompression.JPEG]: "JPEG",
  [BmpCompression.PNG]: "PNG",
};

export const getBmpCompressionName = (code: number): string =>
  compressionNames[code as BmpCompression] || code.toString(16);

export interface BmpInfoHeader {
  biSize: number; // Specifies the number of bytes required by the structure

  biWidth: number; // Specifies the width of the bitmap, in pixels.
  biHeight: number; // Specifies the height of the bitmap, in pixels.
  // * For uncompressed RGB bitmaps, if biHeight is positive, the bitmap is a bottom-up DIB with the origin at the lower left corner.
  //    If biHeight is negative, the bitmap is a top-down DIB with the origin at the upper left corner.
  // * For YUV bitmaps, the bitmap is always top-down, regardless of the sign of biHeight.
  // * For compressed formats, biHeight must be positive, regardless of image orientation.

  biPlanes: number; // Specifies the number of planes for the target device. This value must be set to 1.
  biBitCount: number; // Specifies the number of bits per pixel
  biCompression: number; // For compressed video and YUV formats, this member is a FOURCC code, specified as a DWORD in little-endian order.
  // For example, YUYV video has the FOURCC 'VYUY' or 0x56595559.
  // For 16-bpp bitmaps, if biCompression equals BI_RGB, the format is always RGB 555.
  // If biCompression equals BI_BITFIELDS, the format is either RGB 555 or RGB 565.

  biSizeImage: number; // Specifies the size, in bytes, of the image. This can be set to 0 for uncompressed RGB bitmaps.

  biXPelsPerMeter: number; // Specifies the horizontal resolution, in pixels per meter, of the target device for the bitmap.
  biYPelsPerMeter: number; // Specifies the vertical resolution, in pixels per meter, of the target device for the bitmap.
  biClrUsed: number; // Specifies the number of color indices in the color table that are actually used by the bitmap.

  biClrImportant: number; // Specifies the number of color indices that are considered important for displaying the bitmap.
  // If this value is zero, all colors are important.
}

export const readBmpInfoHeader = (
  buffer: ArrayBuffer,
  offset: number
): BmpInfoHeader => {
  const dv = new DataView(buffer, offset);
  return {
    biSize: dv.getUint32(ofsSize, true),
    biWidth: dv.getInt32(ofsWidth, true),
    biHeight: dv.getInt32(ofsHeight, true),
    biPlanes: dv.getUint16(ofsPlanes, true),
    biBitCount: dv.getUint16(ofsBitCount, true),
    biCompression: dv.getUint32(ofsCompression, true),
    biSizeImage: dv.getUint32(ofsSizeImage, true),
    biXPelsPerMeter: dv.getInt32(ofsXPelsPerMeter, true),
    biYPelsPerMeter: dv.getInt32(ofsYPelsPerMeter, true),
    biClrUsed: dv.getUint32(ofsClrUsed, true),
    biClrImportant: dv.getUint32(ofsClrImportant, true),
  };
};

export const writeBmpInfoHeader = (
  hd: BmpInfoHeader,
  buffer: ArrayBuffer,
  offset: number
): void => {
  const dv = new DataView(buffer, offset);
  dv.setUint32(ofsSize, hd.biSize, true);
  dv.setInt32(ofsWidth, hd.biWidth, true);
  dv.setInt32(ofsHeight, hd.biHeight, true);
  dv.setUint16(ofsPlanes, hd.biPlanes, true);
  dv.setUint16(ofsBitCount, hd.biBitCount, true);

  dv.setUint32(ofsCompression, hd.biCompression, true);
  dv.setUint32(ofsSizeImage, hd.biSizeImage, true);
  dv.setInt32(ofsXPelsPerMeter, hd.biXPelsPerMeter, true);
  dv.setInt32(ofsYPelsPerMeter, hd.biYPelsPerMeter, true);
  dv.setUint32(ofsClrUsed, hd.biClrUsed, true);
  dv.setUint32(ofsClrImportant, hd.biClrImportant, true);
};
