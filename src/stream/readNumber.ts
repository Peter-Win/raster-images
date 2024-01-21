import { RAStream } from "./RAStream";

export const readByte = async (stream: RAStream): Promise<number> => {
  const buf = await stream.read(1);
  return buf[0]!;
};

export const readWordLE = async (stream: RAStream): Promise<number> => {
  const buf = await stream.read(2);
  return buf[0]! + (buf[1]! << 8);
};

export const readWordBE = async (stream: RAStream): Promise<number> => {
  const buf = await stream.read(2);
  return buf[1]! + (buf[0]! << 8);
};

export const readWord = (stream: RAStream, littleEndian: boolean) =>
  littleEndian ? readWordLE(stream) : readWordBE(stream);

export const readInt16LE = async (stream: RAStream): Promise<number> => {
  const buf = await stream.read(2);
  const dv = new DataView(buf.buffer, buf.byteOffset);
  return dv.getInt16(0, true);
};

export const readInt16BE = async (stream: RAStream): Promise<number> => {
  const buf = await stream.read(2);
  const dv = new DataView(buf.buffer, buf.byteOffset);
  return dv.getInt16(0, false);
};

export const readDwordLE = async (stream: RAStream): Promise<number> => {
  const buf = await stream.read(4);
  return buf[0]! + (buf[1]! << 8) + (buf[2]! << 16) + (buf[3]! << 24);
};

export const readDwordBE = async (stream: RAStream): Promise<number> => {
  const buf = await stream.read(4);
  return (buf[0]! << 24) + (buf[1]! << 16) + (buf[2]! << 8) + buf[3]!;
};

export const readDword = (stream: RAStream, littleEndian: boolean) =>
  littleEndian ? readDwordLE(stream) : readDwordBE(stream);

export const readWordArray = async (
  stream: RAStream,
  count: number,
  littleEndian: boolean
): Promise<number[]> => {
  const buf = await stream.read(2 * count);
  const dv = new DataView(buf.buffer, buf.byteOffset);
  const result = new Array<number>(count);
  for (let i = 0; i < count; i++) result[i] = dv.getUint16(i * 2, littleEndian);
  return result;
};

export const readDwordArray = async (
  stream: RAStream,
  count: number,
  littleEndian: boolean
): Promise<number[]> => {
  const buf = await stream.read(4 * count);
  const dv = new DataView(buf.buffer, buf.byteOffset);
  const result = new Array<number>(count);
  for (let i = 0; i < count; i++) result[i] = dv.getUint32(i * 4, littleEndian);
  return result;
};

export const readFloat32Array = async (
  stream: RAStream,
  count: number,
  littleEndian: boolean
): Promise<number[]> => {
  const buf = await stream.read(4 * count);
  const dv = new DataView(buf.buffer, buf.byteOffset);
  const result = new Array<number>(count);
  for (let i = 0; i < count; i++)
    result[i] = dv.getFloat32(i * 4, littleEndian);
  return result;
};
