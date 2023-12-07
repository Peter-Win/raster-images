import { RAStream } from "../../../stream";
import {
  FieldsBlock,
  fieldDword,
  fieldFourCC,
  getFieldOffset,
  writeFieldsBlock,
  writeFieldsBlockToBuffer,
} from "../../FieldsBlock";
import { PngChunkType } from "../PngChunkType";
import { beginCrc, endCrc, updateCrc } from "./calcCrc";

interface ChunkPrefix {
  length: number;
  type: PngChunkType;
}

interface ChunkSuffix {
  crc: number;
}

const descrChunkPrefix: FieldsBlock<ChunkPrefix> = {
  littleEndian: false,
  fields: [fieldDword("length"), fieldFourCC("type")],
};

const descrChunkSuffix: FieldsBlock<ChunkSuffix> = {
  littleEndian: false,
  fields: [fieldDword("crc")],
};

export const writePngChunk = async (
  stream: RAStream,
  type: PngChunkType,
  data?: Uint8Array
) => {
  const prefix: ChunkPrefix = {
    length: data?.length || 0,
    type,
  };
  const prefixBuf = writeFieldsBlockToBuffer(prefix, descrChunkPrefix);
  await stream.write(prefixBuf);
  let crc = beginCrc;
  crc = updateCrc(crc, prefixBuf, getFieldOffset("type", descrChunkPrefix));

  if (data) {
    await stream.write(data);
    crc = updateCrc(crc, data);
  }
  crc = endCrc(crc);
  const suffix: ChunkSuffix = { crc };
  await writeFieldsBlock(suffix, stream, descrChunkSuffix);
};
