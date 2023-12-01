import { RAStream } from "../../stream";
import {
  psdFileHeaderSize,
  readPsdFileHeader,
  signPsdFileHeader,
} from "./PsdFileHeader";

export const detectPsd = async (stream: RAStream): Promise<boolean> => {
  const size = await stream.getSize();
  if (size < psdFileHeaderSize) return false;
  await stream.seek(0);
  const hdr = await readPsdFileHeader(stream);
  return hdr.signature === signPsdFileHeader && hdr.version === 1;
};
