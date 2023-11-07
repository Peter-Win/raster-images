import { RAStream } from "../../stream";
import {
  FieldsBlock,
  fieldByte,
  fieldWord,
  fieldsBlockSize,
  readFieldsBlockFromBuffer,
} from "../FieldsBlock";

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

const descr: FieldsBlock<GifImageDescriptor> = {
  littleEndian: true,
  fields: [
    fieldWord("left"),
    fieldWord("top"),
    fieldWord("width"),
    fieldWord("height"),
    fieldByte("flags"),
  ],
};

const sizeOfImageDescriptor = fieldsBlockSize(descr);

export const imageDescriptorFromBuffer = (
  buf: Uint8Array
): GifImageDescriptor => readFieldsBlockFromBuffer(buf, descr);

export const readGifImageDescriptor = async (
  stream: RAStream
): Promise<GifImageDescriptor> =>
  imageDescriptorFromBuffer(await stream.read(sizeOfImageDescriptor));

export const gifInterlaced = (flags: number): boolean =>
  (flags & GifImgDescFlags.interlace) !== 0;
