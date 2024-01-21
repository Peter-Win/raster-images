import { RAStream, readWord } from "../../stream";
import {
  FieldsBlock,
  fieldDword,
  fieldWord,
  readFieldsBlock,
} from "../FieldsBlock";
import { onInvalidFormat } from "../onInvalidFormat";

export interface TiffFileHeader {
  littleEndian: boolean;
  offset: number;
}

export const getTiffByteOrder = async (
  stream: RAStream
): Promise<boolean | undefined> => {
  const w = await stream.read(2);
  if (w[0] === 0x49 && w[1] === 0x49) return true;
  if (w[0] === 0x4d && w[1] === 0x4d) return false;
  return undefined;
};

export const checkTiffFormat = async (stream: RAStream): Promise<boolean> => {
  await stream.seek(0);
  const littleEndian = await getTiffByteOrder(stream);
  if (littleEndian === undefined) return false;
  return (await readWord(stream, littleEndian)) === 42;
};

interface ImageFileHeader {
  test42: number;
  offset: number;
}

const descr = (littleEndian: boolean): FieldsBlock<ImageFileHeader> => ({
  littleEndian,
  fields: [fieldWord("test42"), fieldDword("offset")],
});

export const readTiffFileHeader = async (
  stream: RAStream
): Promise<TiffFileHeader> => {
  const order = await getTiffByteOrder(stream);
  if (order === undefined) {
    onInvalidFormat("TIFF", stream.name);
  }
  const littleEndian = !!order;
  const { test42, offset } = await readFieldsBlock(stream, descr(littleEndian));
  if (test42 !== 42) onInvalidFormat("TIFF", stream.name);
  return { littleEndian, offset };
};
