// https://learn.microsoft.com/en-us/windows/win32/api/wingdi/ns-wingdi-bitmapinfoheader

import { RAStream } from "../../stream";
import {
  FieldsBlock,
  fieldDword,
  fieldLong,
  fieldWord,
  fieldsBlockSize,
  readFieldsBlockFromBuffer,
  writeFieldsBlock,
} from "../FieldsBlock";

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
  // TODO: Здесь не поддерживаются FOURCC-коды, поэтому поле числовое.

  biSizeImage: number; // Specifies the size, in bytes, of the image. This can be set to 0 for uncompressed RGB bitmaps.

  biXPelsPerMeter: number; // Specifies the horizontal resolution, in pixels per meter, of the target device for the bitmap.
  biYPelsPerMeter: number; // Specifies the vertical resolution, in pixels per meter, of the target device for the bitmap.
  biClrUsed: number; // Specifies the number of color indices in the color table that are actually used by the bitmap.

  biClrImportant: number; // Specifies the number of color indices that are considered important for displaying the bitmap.
  // If this value is zero, all colors are important.
}

const descrInfo: FieldsBlock<BmpInfoHeader> = {
  littleEndian: true,
  fields: [
    fieldDword("biSize"),
    fieldLong("biWidth"),
    fieldLong("biHeight"),
    fieldWord("biPlanes"),
    fieldWord("biBitCount"),
    fieldDword("biCompression"), // ! FOURCC не поддерживаются
    fieldDword("biSizeImage"),
    fieldLong("biXPelsPerMeter"),
    fieldLong("biYPelsPerMeter"),
    fieldDword("biClrUsed"),
    fieldDword("biClrImportant"),
  ],
};

export const bmpInfoHeaderSize = fieldsBlockSize(descrInfo);

export const readBmpInfoHeaderFromBuffer = (
  buffer: Uint8Array
): BmpInfoHeader => readFieldsBlockFromBuffer(buffer, descrInfo);

export const readBmpInfoHeader = async (
  stream: RAStream
): Promise<BmpInfoHeader> => {
  const buf = await stream.read(bmpInfoHeaderSize);
  return readBmpInfoHeaderFromBuffer(buf);
};

export const writeBmpInfoHeader = async (hd: BmpInfoHeader, stream: RAStream) =>
  writeFieldsBlock(hd, stream, descrInfo);
