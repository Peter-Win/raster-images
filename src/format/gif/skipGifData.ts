import { createCrossBlob } from "../../utils/CrossBlob";
import { RAStream, isEndOfStream, readByte } from "../../stream";

export const skipGifData = async (stream: RAStream): Promise<void> => {
  let pos = await stream.getPos();
  const size = await stream.getSize();
  while (pos < size) {
    const code: number = await readByte(stream);
    if (code === 0) break;
    pos += code + 1;
    await stream.seek(pos);
  }
};

export const readGifDataAsText = async (stream: RAStream): Promise<string> => {
  const chunks = [];
  while (!(await isEndOfStream(stream))) {
    const chunkLength: number = await readByte(stream);
    if (chunkLength === 0) break;
    chunks.push(await stream.read(chunkLength));
  }
  const blob = createCrossBlob(chunks);
  return blob.text();
};
