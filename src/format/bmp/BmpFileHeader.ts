// https://learn.microsoft.com/en-us/windows/win32/api/wingdi/ns-wingdi-bitmapfileheader
// WORD  bfType;         2  +0
// DWORD bfSize;         4  +2
// WORD  bfReserved1;    2  +6
// WORD  bfReserved2;    2  +8
// DWORD bfOffBits;      4  +10
//                          +14

import { RAStream } from "../../stream";
import {
  FieldsBlock,
  fieldDword,
  fieldWord,
  fieldsBlockSize,
  readFieldsBlock,
  writeFieldsBlock,
} from "../FieldsBlock";

export const bmpSignature = 0x4d42;

export interface BmpFileHeader {
  bfType?: number; // not need for write
  bfSize: number;
  bfOffBits: number;
}

const descr: FieldsBlock<BmpFileHeader> = {
  littleEndian: true,
  fields: [
    { ...fieldWord("bfType"), defaultValue: bmpSignature },
    fieldDword("bfSize"),
    { size: 4 },
    fieldDword("bfOffBits"),
  ],
};

export const bmpFileHeaderSize = fieldsBlockSize(descr);

export const readBmpFileHeader = async (stream: RAStream) =>
  readFieldsBlock(stream, descr);

export const writeBmpFileHeader = async (
  hd: BmpFileHeader,
  stream: RAStream
) => {
  await writeFieldsBlock(hd, stream, descr);
};
