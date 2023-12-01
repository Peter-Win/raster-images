import { RAStream, readDwordBE, readWordBE } from "../../../stream";
import { readFourCC, readPascalString } from "../psdDataUtils";
import { PsdResId } from "./PsdResId";

// Image Resource Blocks
// Содержит различные метаданные, которые нужны далеко не всегда

export type PsdResourceDef = {
  id: PsdResId;
  name: string; // usually an empty string
  offset: number;
  size: number;
};

export type PsdResources = Partial<Record<PsdResId, PsdResourceDef>>;

export const readPsdResources = async (
  stream: RAStream,
  blockSize: number
): Promise<PsdResources> => {
  const res: PsdResources = {};
  const finalPos = (await stream.getPos()) + blockSize;
  while ((await stream.getPos()) + 12 < finalPos) {
    const sign = await readFourCC(stream);
    if (sign !== "8BIM") break;
    const id = (await readWordBE(stream)) as PsdResId;
    const name = await readPascalString(stream, 2);
    const size = await readDwordBE(stream);
    const offset = await stream.getPos();
    res[id] = { id, name, offset, size };

    await stream.skip(((size + 1) >> 1) << 1);
  }
  return res;
};
