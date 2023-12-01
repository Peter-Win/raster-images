import { decode } from "../../utils";
import { RAStream, readByte } from "../../stream";

export const readFourCC = async (stream: RAStream): Promise<string> => {
  const buf = await stream.read(4);
  return decode(buf);
};

export const getFourCC = (buffer: Uint8Array, offset: number): string =>
  decode(buffer.slice(offset, offset + 4));

// Pascal string, padded to make the size even (a null name consists of two bytes of 0)
export const readPascalString = async (
  stream: RAStream,
  pad = 4
): Promise<string> => {
  const len = await readByte(stream);
  const bufSize = Math.floor((len + pad) / pad) * pad - 1;
  const buf = await stream.read(bufSize);
  return decode(buf.slice(0, len), "windows-1251");
};

export const readUnicodeStringLimited = async (
  stream: RAStream,
  chunkSize: number
): Promise<string> => {
  const buf = await stream.read(chunkSize);
  const dv = new DataView(buf.buffer, buf.byteOffset);
  const count = dv.getUint32(0, false);
  let pos = 4;
  let result = "";
  for (let i = 0; i < count; i++) {
    result += String.fromCharCode(dv.getUint16(pos, false));
    pos += 2;
  }
  return result;
};

export const readBool4 = async (stream: RAStream): Promise<number> => {
  const buf = await stream.read(4);
  return buf[0]!;
};
