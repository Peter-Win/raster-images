import { RAStream } from "../../stream";

// 5.2 PNG signature
// https://www.w3.org/TR/2003/REC-PNG-20031110/#5PNG-file-signature
const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];

export const checkPngSignature = async (stream: RAStream): Promise<boolean> => {
  const streamSize = await stream.getSize();
  const signSize = pngSignature.length;
  if (streamSize < signSize) return false;
  await stream.seek(0);
  const buf = await stream.read(signSize);
  return pngSignature.every((needByte, i) => needByte === buf[i]);
};
