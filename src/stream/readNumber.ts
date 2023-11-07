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

export const readDwordLE = async (stream: RAStream): Promise<number> => {
  const buf = await stream.read(4);
  return buf[0]! + (buf[1]! << 8) + (buf[2]! << 16) + (buf[3]! << 24);
};

export const readDwordBE = async (stream: RAStream): Promise<number> => {
  const buf = await stream.read(4);
  return (buf[0]! << 24) + (buf[1]! << 16) + (buf[2]! << 8) + buf[3]!;
};
