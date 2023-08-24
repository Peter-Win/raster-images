import { RAStream } from "./RAStream";

export const readByte = async (stream: RAStream): Promise<number> => {
  const buf = await stream.read(1);
  return buf[0]!;
};
