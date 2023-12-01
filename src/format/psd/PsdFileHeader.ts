import { RAStream } from "../../stream";
import {
  FieldsBlock,
  fieldDword,
  fieldFourCC,
  fieldWord,
  fieldsBlockSize,
  readFieldsBlock,
  writeFieldsBlock,
} from "../FieldsBlock";

export const enum PsdColorMode {
  Bitmap = 0,
  Grayscale = 1,
  Indexed = 2,
  RGB = 3,
  CMYK = 4,
  Multichannel = 7,
  Duotone = 8,
  Lab = 9,
}

export const psdColorModeName: Record<PsdColorMode, string> = {
  [PsdColorMode.Bitmap]: "Bitmap",
  [PsdColorMode.Grayscale]: "Grayscale",
  [PsdColorMode.Indexed]: "Indexed",
  [PsdColorMode.RGB]: "RGB",
  [PsdColorMode.CMYK]: "CMYK",
  [PsdColorMode.Multichannel]: "Multichannel",
  [PsdColorMode.Duotone]: "Duotone",
  [PsdColorMode.Lab]: "Lab",
};

export interface PsdFileHeader {
  signature?: string;
  version?: number;
  nChannels: number;
  height: number;
  width: number;
  depth: number; // 1, 8, 16 and 32
  colorMode: PsdColorMode;
}
export const signPsdFileHeader = "8BPS";

const psdHeaderDescr: FieldsBlock<PsdFileHeader> = {
  littleEndian: false,
  fields: [
    { ...fieldFourCC("signature"), defaultValue: signPsdFileHeader },
    { ...fieldWord("version"), defaultValue: 1 },
    { size: 6 },
    fieldWord("nChannels"),
    fieldDword("height"),
    fieldDword("width"),
    fieldWord("depth"),
    fieldWord("colorMode"),
  ],
};

export const psdFileHeaderSize = fieldsBlockSize(psdHeaderDescr);

export const readPsdFileHeader = async (
  stream: RAStream
): Promise<PsdFileHeader> => readFieldsBlock(stream, psdHeaderDescr);

export const writePsdFileHeader = async (hd: PsdFileHeader, stream: RAStream) =>
  writeFieldsBlock(hd, stream, psdHeaderDescr);
