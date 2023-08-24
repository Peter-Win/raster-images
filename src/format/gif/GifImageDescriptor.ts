import { RAStream } from "../../stream";

const ofsLeft = 0;
const ofsTop = ofsLeft + 2;
const ofsWidth = ofsTop + 2;
const ofsHeight = ofsWidth + 2;
const ofsFlags = ofsHeight + 2;
const sizeOfImageDescriptor = ofsFlags + 1;

// <Packed Fields>  =      Local Color Table Flag        1 Bit
//                              Interlace Flag                1 Bit
//                              Sort Flag                     1 Bit
//                              Reserved                      2 Bits
//                              Size of Local Color Table     3 Bits

export enum GifImgDescFlags {
  localTable = 0x80,
  interlace = 0x40,
  sort = 0x20,
  tableSize = 7,
}

export interface GifImageDescriptor {
  left: number;
  top: number;
  width: number;
  height: number;
  flags: number;
}

export const imageDescriptorFromBuffer = (
  buf: Uint8Array
): GifImageDescriptor => {
  const dv = new DataView(buf.buffer, buf.byteOffset);
  return {
    left: dv.getUint16(ofsLeft, true),
    top: dv.getUint16(ofsTop, true),
    width: dv.getUint16(ofsWidth, true),
    height: dv.getUint16(ofsHeight, true),
    flags: dv.getUint8(ofsFlags),
  };
};

export const readGifImageDescriptor = async (
  stream: RAStream
): Promise<GifImageDescriptor> =>
  imageDescriptorFromBuffer(await stream.read(sizeOfImageDescriptor));

export const gifInterlaced = (flags: number): boolean =>
  (flags & GifImgDescFlags.interlace) !== 0;
