// import { RAStream } from "../../stream";
import { FieldsBlock, fieldFourCC, fieldWord } from "../FieldsBlock";

// --------------

interface PsdFileHeader {
  signature: string;
  version: number;
  nChannels: number;
  height: number;
  width: number;
  depth: number;
}

export const psdHeaderDescr: FieldsBlock<PsdFileHeader> = {
  littleEndian: false,
  fields: [
    fieldFourCC("signature"),
    fieldWord("version"),
    { size: 6 },
    fieldWord("nChannels"),
  ],
};
