import { RAStream } from "../../stream";
import { ErrorRI } from "../../utils";

const ofsIdLength = 0;
const szIdLength = 1;
const ofsColorMapType = ofsIdLength + szIdLength;
const szColorMapType = 1;
const ofsImageType = ofsColorMapType + szColorMapType;
const szImageType = 1;
const ofsColorMapStart = ofsImageType + szImageType;
const szColorMapStart = 2;
const ofsColorMapLength = ofsColorMapStart + szColorMapStart;
const szColorMapLength = 2;
const ofsColorItemSize = ofsColorMapLength + szColorMapLength;
const szColorItemSize = 1;
const ofsX0 = ofsColorItemSize + szColorItemSize;
const szX0 = 2;
const ofsY0 = ofsX0 + szX0;
const szY0 = 2;
const ofsWidth = ofsY0 + szY0;
const szWidth = 2;
const ofsHeight = ofsWidth + szWidth;
const szHeight = 2;
const ofsDepth = ofsHeight + szHeight;
const szDepth = 1;
const ofsImageDescriptor = ofsDepth + szDepth;
const szImageDescriptor = 1;

export const targaHeaderSize = ofsImageDescriptor + szImageDescriptor;

export const enum TargaImageType {
  noImageData = 0,
  uncompressedColorMapped = 1,
  uncompressedTrueColor = 2,
  uncompressedGray = 3,
  rleColorMapped = 9,
  rleTrueColor = 10,
  rleGray = 11,
}

export const enum TargaImageDescriptor {
  attrMask = 0x0f, // Маска для кол.бит в A-компоненте
  right2left = 0x10, // Флаг, указ порядок сканирования справав налево
  top2bottom = 0x20, // Флаг, указ. порядок сканирования сверху вниз
  interleaveMask = 0xc0, // Необходимо выдать предупреждение, что эти флаги не поддерживаются
}

export type TargaDepth = 8 | 16 | 24 | 32;
const possibleDepth = [8, 16, 24, 32];

export interface TargaHeader {
  idLength: number;
  colorMapType: 0 | 1;
  imageType: TargaImageType;
  // color map info
  colorMapStart: number;
  colorMapLength: number;
  colorItemSize: number; // Typically 15, 16, 24 or 32-bit values are used.
  // video data info
  x0: number; // the absolute horizontal coordinate for the **lower left** corner of the image
  y0: number; // the absolute vertical coordinate for the **lower left** corner of the image
  width: number;
  height: number;
  depth: TargaDepth;
  imageDescriptor: number;
}

export const makeTargaImageDescriptor = (
  attr: number,
  top2bottom: boolean,
  right2left?: boolean
) =>
  (attr & TargaImageDescriptor.attrMask) |
  (right2left ? TargaImageDescriptor.right2left : 0) |
  (top2bottom ? TargaImageDescriptor.top2bottom : 0);

export const checkTargaHeader = ({ depth, width, height }: TargaHeader) => {
  if (possibleDepth.indexOf(depth) < 0)
    throw new ErrorRI("Invalid Targa pixel depth <depth>", { depth });
  if (width > 0xffff || height > 0xffff)
    throw new ErrorRI("Invalid Targa image size <width> x <height>", {
      width,
      height,
    });
};

export const targaHeaderFromBuffer = (buf: Uint8Array): TargaHeader => {
  const dv = new DataView(buf.buffer, buf.byteOffset);
  return {
    idLength: buf[ofsIdLength]!,
    colorMapType: buf[ofsColorMapType]! as 0 | 1,
    imageType: buf[ofsImageType]!,
    colorMapStart: dv.getUint16(ofsColorMapStart, true),
    colorMapLength: dv.getUint16(ofsColorMapLength, true),
    colorItemSize: buf[ofsColorItemSize]!,
    x0: dv.getUint16(ofsX0, true),
    y0: dv.getUint16(ofsY0, true),
    width: dv.getUint16(ofsWidth, true),
    height: dv.getUint16(ofsHeight, true),
    depth: buf[ofsDepth]! as TargaDepth,
    imageDescriptor: buf[ofsImageDescriptor]!,
  };
};

export const readTargaHeader = async (
  stream: RAStream
): Promise<TargaHeader> => {
  const buf = await stream.read(targaHeaderSize);
  return targaHeaderFromBuffer(buf);
};

export const targaHeaderToBuffer = (h: TargaHeader): Uint8Array => {
  const buf = new Uint8Array(targaHeaderSize);
  const dv = new DataView(buf.buffer, buf.byteOffset);
  buf[ofsIdLength] = h.idLength;
  buf[ofsColorMapType] = h.colorMapType;
  buf[ofsImageType] = h.imageType;
  dv.setUint16(ofsColorMapStart, h.colorMapStart, true);
  dv.setUint16(ofsColorMapLength, h.colorMapLength, true);
  buf[ofsColorItemSize] = h.colorItemSize;
  dv.setUint16(ofsX0, h.x0, true);
  dv.setUint16(ofsY0, h.y0, true);
  dv.setUint16(ofsWidth, h.width, true);
  dv.setUint16(ofsHeight, h.height, true);
  buf[ofsDepth] = h.depth;
  buf[ofsImageDescriptor] = h.imageDescriptor;
  return buf;
};
