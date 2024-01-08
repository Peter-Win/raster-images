import { ErrorRI } from "../../../utils";
import { RAStream } from "../../../stream";
import { Ifd } from "../ifd/Ifd";
import { getIfdString } from "../ifd/IfdEntry";

export const getTiffTimeStr = async (
  tagId: number,
  ifd: Ifd,
  stream: RAStream
): Promise<string | undefined> => {
  const entry = ifd.entries[tagId];
  if (!entry) return undefined;
  const strTime = await getIfdString(entry, stream, ifd.littleEndian);
  // See huffman_no_makeup.tif with non-standard format of DateTime: "2017:12:01 20:28:37 EST"
  if (!/^\d{4}:\d\d:\d\d \d\d:\d\d:\d\d/.test(strTime))
    throw new ErrorRI("Invalid time <t>", { t: strTime });
  return strTime
    .split(" ")
    .map((s, i) => (i === 0 ? s.replace(/:/g, "-") : s))
    .slice(0, 2)
    .join(" ");
};
