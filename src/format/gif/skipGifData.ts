import { RAStream, readByte } from "../../stream";

export const skipGifData = async (stream: RAStream) => {
  let pos = await stream.getPos();
  const size = await stream.getSize();
  while (pos < size) {
    const code: number = await readByte(stream);
    if (code === 0) break;
    pos += code + 1;
    await stream.seek(pos);
  }
};
