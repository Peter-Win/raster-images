import { ImageInfo } from "../../../ImageInfo";
import { Variables } from "../../../ImageInfo/Variables";
import { PixelFormat } from "../../../PixelFormat";
import { Point } from "../../../math/Point";
import { ErrorRI } from "../../../utils";

/*
https://www.w3.org/TR/2003/REC-PNG-20031110/#11IHDR
Width	4 bytes
Height	4 bytes
Bit depth	1 byte
Colour type	1 byte
Compression method	1 byte
Filter method	1 byte
Interlace method	1 byte
*/
const ofsWidth = 0;
const ofsHeight = ofsWidth + 4;
const ofsDepth = ofsHeight + 4;
const ofsColorType = ofsDepth + 1;
// compression and filters are ignored. because there are always = 0
const ofsCompression = ofsColorType + 1;
const ofsFilter = ofsCompression + 1;
const ofsInterlace = ofsFilter + 1;
const headerSize = ofsInterlace + 1;

enum ColorType {
  grayscale = 0,
  truecolor = 2,
  indexed = 3,
  grayscaleAlpha = 4,
  truecolorAlpha = 6,
}

const pixelFormat: Record<ColorType, (depth: number) => string> = {
  [ColorType.grayscale]: (depth) => `G${depth}`,
  [ColorType.truecolor]: (depth) => `R${depth}G${depth}B${depth}`,
  [ColorType.indexed]: (depth) => `I${depth}`,
  [ColorType.grayscaleAlpha]: (depth) => `G${depth}A${depth}`,
  [ColorType.truecolorAlpha]: (depth) => `R${depth}G${depth}B${depth}A${depth}`,
};

const colorName: Record<ColorType, string> = {
  [ColorType.grayscale]: "Greyscale",
  [ColorType.truecolor]: "Truecolour",
  [ColorType.indexed]: "Indexed-colour",
  [ColorType.grayscaleAlpha]: "Greyscale with alpha",
  [ColorType.truecolorAlpha]: "Truecolour with alpha",
};

export const readPngHeader = (buffer: Uint8Array): ImageInfo => {
  if (buffer.byteLength !== headerSize) {
    throw new ErrorRI("Invalid PNG header size");
  }
  const dv = new DataView(buffer.buffer, buffer.byteOffset);
  const width = dv.getUint32(ofsWidth, false);
  const height = dv.getUint32(ofsHeight, false);
  const depth = buffer[ofsDepth]!;
  const colorType = buffer[ofsColorType] as ColorType;
  const interlaced = buffer[ofsInterlace]!;

  const size = new Point(width, height);
  const makeSign = pixelFormat[colorType];
  if (!makeSign) {
    const ct = colorName[colorType] ?? `#${colorType}`;
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
