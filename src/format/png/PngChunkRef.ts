import { RAStream } from "../../stream";
import { PngChunkType } from "./PngChunkType";

export interface PngChunkRef {
  type: PngChunkType;
  length: number;
  dataPosition: number;
  nextChunkPosition: number;
}

export const getCrcPosition = (chunkRef: PngChunkRef): number =>
  chunkRef.nextChunkPosition - 4;

export const readPngChunkRef = async (
  stream: RAStream
): Promise<PngChunkRef> => {
  const buf = await stream.read(8);
  const dv = new DataView(buf.buffer, buf.byteOffset);
  const strType: string = Array.from(buf.slice(4))
    .map((byte) => String.fromCharCode(byte))
    .join("");
  const length = dv.getUint32(0, false);
  const dataPosition = await stream.getPos();
  return {
    type: strType as PngChunkType,
    length,
    dataPosition,
    nextChunkPosition: dataPosition + length + 4,
  };
};

export const readPngChunkRest = async (
  stream: RAStream,
  chunk: PngChunkRef,
  needToSetPosition: boolean
): Promise<[Uint8Array, number]> => {
  if (needToSetPosition) {
    await stream.seek(chunk.dataPosition);
  }
  const data = await stream.read(chunk.length);
  const crcBuf = await stream.read(4);
  const crcDataView = new DataView(crcBuf.buffer, crcBuf.byteOffset, 4);
  const crc = crcDataView.getUint32(0, false);
  return [data, crc];
};

export const readPngChunkDataOnly = async (
  stream: RAStream,
  chunk: PngChunkRef
): Promise<Uint8Array> => {
  const data = await stream.read(chunk.length);
  await stream.skip(4);
  return data;
};
