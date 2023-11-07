import { RAStream } from "../../stream";
import {
  FieldsBlock,
  fieldDword,
  fieldWord,
  fieldsBlockSize,
  readFieldsBlockFromBuffer,
  writeFieldsBlock,
} from "../FieldsBlock";

export interface BmpCoreHeader {
  bcSize: number;
  bcWidth: number;
  bcHeight: number;
  bcPlanes: number;
  bcBitCount: number;
}

const descrCore: FieldsBlock<BmpCoreHeader> = {
  littleEndian: true,
  fields: [
    fieldDword("bcSize"),
    fieldWord("bcWidth"),
    fieldWord("bcHeight"),
    fieldWord("bcPlanes"),
    fieldWord("bcBitCount"),
  ],
};

export const bmpCoreHeaderSize = fieldsBlockSize(descrCore);

export const readBmpCoreHeaderFromBuffer = (
  buffer: Uint8Array
): BmpCoreHeader => readFieldsBlockFromBuffer(buffer, descrCore);

export const readBmpCoreHeader = async (stream: RAStream) => {
  const buf = await stream.read(bmpCoreHeaderSize);
  return readBmpCoreHeaderFromBuffer(buf);
};

export const writeBmpCoreHeader = async (
  hdr: BmpCoreHeader,
  stream: RAStream
) => writeFieldsBlock(hdr, stream, descrCore);
