import { RAStream } from "../../stream";
import { Palette, createPalette } from "../../Palette";

export const readPsdPalette = async (
  stream: RAStream,
  count: number
): Promise<Palette> => {
  const buf = await stream.read(3 * count);
  const pal = createPalette(count);
  let r = 0;
  let g = count;
  let b = g + count;
  for (let i = 0; i < count; i++) {
    pal[i]![0] = buf[b++]!;
    pal[i]![1] = buf[g++]!;
    pal[i]![2] = buf[r++]!;
  }
  return pal;
};
