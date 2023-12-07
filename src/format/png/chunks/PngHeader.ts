import {
  FieldsBlock,
  fieldByte,
  fieldDword,
  fieldsBlockSize,
  readFieldsBlockFromBuffer,
  writeFieldsBlockToBuffer,
} from "../../FieldsBlock";
import { ImageInfo } from "../../../ImageInfo";
import { Variables } from "../../../ImageInfo/Variables";
import { PixelFormat } from "../../../PixelFormat";
import { Point } from "../../../math/Point";
import { ErrorRI } from "../../../utils";

/*
https://www.w3.org/TR/2003/REC-PNG-20031110/#11IHDR
*/

export const enum PngColorType {
  grayscale = 0,
  truecolor = 2,
  indexed = 3,
  grayscaleAlpha = 4,
  truecolorAlpha = 6,
}

const pixelFormat: Record<PngColorType, (depth: number) => string> = {
  [PngColorType.grayscale]: (depth) => `G${depth}`,
  [PngColorType.truecolor]: (depth) => `R${depth}G${depth}B${depth}`,
  [PngColorType.indexed]: (depth) => `I${depth}`,
  [PngColorType.grayscaleAlpha]: (depth) => `G${depth}A${depth}`,
  [PngColorType.truecolorAlpha]: (depth) =>
    `R${depth}G${depth}B${depth}A${depth}`,
};

const colorName: Record<PngColorType, string> = {
  [PngColorType.grayscale]: "Greyscale",
  [PngColorType.truecolor]: "Truecolour",
  [PngColorType.indexed]: "Indexed-colour",
  [PngColorType.grayscaleAlpha]: "Greyscale with alpha",
  [PngColorType.truecolorAlpha]: "Truecolour with alpha",
};

// The IHDR chunk
export interface PngHeader {
  width: number;
  height: number;
  bitDepth: number;
  colorType: PngColorType;
  compression: number;
  filter: number;
  interlaced: number;
}

const descrHeader: FieldsBlock<PngHeader> = {
  littleEndian: false,
  fields: [
    fieldDword("width"),
    fieldDword("height"),
    fieldByte("bitDepth"),
    fieldByte("colorType"),
    fieldByte("compression"),
    fieldByte("filter"),
    fieldByte("interlaced"),
  ],
};

const headerSize = fieldsBlockSize(descrHeader);

export const readPngHeader = (buffer: Uint8Array): ImageInfo => {
  if (buffer.byteLength !== headerSize) {
    throw new ErrorRI("Invalid PNG header size");
  }
  const hdr = readFieldsBlockFromBuffer(buffer, descrHeader);
  const { colorType, bitDepth: depth, interlaced } = hdr;

  const size = new Point(hdr.width, hdr.height);
  const makeSign = pixelFormat[colorType];
  if (!makeSign) {
    const ct: string = colorName[colorType] ?? `#${colorType}`;
    throw new ErrorRI(
      "Invalid pixel format. Color type: <ct>, Bit depth: <depth>",
      { depth, ct }
    );
  }
  const sign = makeSign(depth);
  const fmt = new PixelFormat(sign);
  const vars: Variables = {
    interlaced,
  };
  return {
    size,
    fmt,
    vars,
  };
};

export const makePngHeaderBuffer = (header: PngHeader) =>
  writeFieldsBlockToBuffer(header, descrHeader);

export const makePngColorType = (fmt: PixelFormat): PngColorType => {
  switch (fmt.colorModel) {
    case "Indexed":
      return PngColorType.indexed;
    case "Gray":
      return fmt.alpha ? PngColorType.grayscaleAlpha : PngColorType.grayscale;
    case "RGB":
      return fmt.alpha ? PngColorType.truecolorAlpha : PngColorType.truecolor;
    default:
      throw new ErrorRI("Unsupported PNG color model: <m>", {
        m: fmt.colorModel,
      });
  }
};
