import { Palette, createPalette } from "../../Palette";
import { RAStream } from "../../stream";
import { TiffTag } from "./TiffTag";
import { Ifd } from "./ifd/Ifd";
import { getIfdNumbers } from "./ifd/IfdEntry";

export const loadTiffPalette = async (
  ifd: Ifd,
  stream: RAStream
): Promise<Palette> => {
  const eColorMap = ifd.getEntry(TiffTag.ColorMap);
  const colorMap = await getIfdNumbers(eColorMap, stream, ifd.littleEndian);
  const colorsCount = Math.floor(colorMap.length / 3);
  const palette = createPalette(colorsCount);
  const ofsGreen = colorsCount;
  const ofsBlue = colorsCount * 2;
  for (let i = 0; i < colorsCount; i++) {
    const red = colorMap[i]!;
    const green = colorMap[i + ofsGreen]!;
    const blue = colorMap[i + ofsBlue]!;
    palette[i] = [blue >> 8, green >> 8, red >> 8, 0xff];
  }
  return palette;
};
