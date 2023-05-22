import { ImageInfo } from "../../ImageInfo";
import { RAStream } from "../../stream/RAStream";
import { ImageReader } from "../../transfer/ImageReader";
import { calcPitch } from "../../ImageInfo/calcPitch";
import { getSizeAndDepth } from "../../ImageInfo/getSizeAndDepth";

type Params = {
  stream: RAStream;
  reader: ImageReader;
  info: ImageInfo;
  isUpDown: boolean;
};

export const readUncompressedImage = async (params: Params) => {
  const { stream, reader, info, isUpDown } = params;
  const { width, height, depth } = getSizeAndDepth(info);
  const lineSize = calcPitch(width, depth);
  const alignedLineSize = calcPitch(width, depth, 4);
  const lineDelta = alignedLineSize - lineSize;

  const deltaY = isUpDown ? 1 : -1;
  let y: number = isUpDown ? 0 : height - 1;

  for (let j = 0; j < height; j++) {
    const dst = await reader.getRowBuffer(y);
    await stream.readBuffer(dst, lineSize);
    if (lineDelta) {
      await stream.skip(lineDelta);
    }
    if (reader.finishRow) {
      await reader.finishRow();
    }
    y += deltaY;
  }
};
