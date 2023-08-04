import { RAStream } from "./RAStream";

export const isEndOfStream = async (stream: RAStream): Promise<boolean> =>
  (await stream.getPos()) >= (await stream.getSize());
