import { RAStream, readInt16BE, readWordBE } from "../../../stream";
import { PsdResourceDef } from "./PsdResources";

export const loadPsdResourceData = async (
  stream: RAStream,
  { offset, size }: PsdResourceDef
): Promise<Uint8Array> => {
  await stream.seek(offset);
  return stream.read(size);
};

export const loadPsdResWord = async (
  stream: RAStream,
  resDef: PsdResourceDef
): Promise<number | undefined> => {
  if (resDef.size === 2) {
    await stream.seek(resDef.offset);
    return readWordBE(stream);
  }
  return undefined;
};

export const loadPsdResLong = async (
  stream: RAStream,
  resDef: PsdResourceDef
): Promise<number | undefined> => {
  if (resDef.size === 4) {
    await stream.seek(resDef.offset);
    return readInt16BE(stream);
  }
  return undefined;
};

export const loadPsdResWords = async (
  stream: RAStream,
  resDef: PsdResourceDef
): Promise<number[]> => {
  const buf = await loadPsdResourceData(stream, resDef);
  const dv = new DataView(buf.buffer, buf.byteOffset);
  const res: number[] = [];
  for (let i = 0; i < buf.length / 2; i++) {
    res[i] = dv.getUint16(i * 2, false);
  }
  return res;
};
