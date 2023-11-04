import { RAStream } from "../../stream";
import { utf8ToBytes } from "../../utils";

export interface TargaFooter {
  extensionAreaOffset: number;
  developerDirectoryOffset: number;
}

const signature = "TRUEVISION-XFILE.\0";
const footerSize = 8 + signature.length;

export const readTargaFooter = async (
  stream: RAStream
): Promise<TargaFooter | undefined> => {
  const size = await stream.getSize();
  if (size <= footerSize) return undefined;
  await stream.seek(size - footerSize);
  const buf = await stream.read(footerSize);
  let i = 0;
  while (i < signature.length && signature.charCodeAt(i) === buf[8 + i]) i++;
  if (i !== signature.length) return undefined;
  const dv = new DataView(buf.buffer, buf.byteOffset);
  return {
    extensionAreaOffset: dv.getUint32(0, true),
    developerDirectoryOffset: dv.getUint32(4, true),
  };
};

export const writeTargaFooter = async (
  stream: RAStream,
  footer: TargaFooter
) => {
  const buf = utf8ToBytes(`--------${signature}`);
  const dv = new DataView(buf.buffer, buf.byteOffset);
  dv.setUint32(0, footer.extensionAreaOffset, true);
  dv.setUint32(4, footer.developerDirectoryOffset, true);
  await stream.write(buf);
};
