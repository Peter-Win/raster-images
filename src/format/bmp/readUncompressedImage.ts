import { ImageInfo } from "../../ImageInfo";
import { RAStream } from "../../stream/RAStream";
import { ImageReader } from "../../transfer/ImageReader";
import { calcPitch } from "../../ImageInfo/calcPitch";
import { getSizeAndDepth } from "../../ImageInfo/getSizeAndDepth";
import { readLoop } from "../../transfer/readLoop";
import { stdRowOrder } from "../../transfer/rowOrder";

type Params = {
  stream: RAStream;
  reader: ImageReader;
  info: ImageInfo;
  isUpDown: boolean;
};

export const readUncompressedImage = async (params: Params) => {
  const { stream, reader, info, isUpDown } = params;
  const { width, depth } = getSizeAndDepth(info);
  const lineSize = calcPitch(width, depth);
  const alignedLineSize = calcPitch(width, depth, 4);
  const lineDelta = alignedLineSize - lineSize;

  await readLoop({
    reader,
    info,
    rowOrder: stdRowOrder(isUpDown ? "forward" : "backward"),
    async onRow(row) {
      await stream.readBuffer(row, lineSize);
      if (lineDelta) {
        await stream.skip(lineDelta);
      }
    },
  });
};
