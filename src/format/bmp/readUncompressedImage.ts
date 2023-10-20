import { ImageInfo } from "../../ImageInfo";
import { RAStream } from "../../stream/RAStream";
import { calcPitch } from "../../ImageInfo/calcPitch";
import { getSizeAndDepth } from "../../ImageInfo/getSizeAndDepth";
import { stdRowOrder } from "../../Converter/rowOrder";
import { Converter, readImage } from "../../Converter";

type Params = {
  stream: RAStream;
  converter: Converter;
  info: ImageInfo;
  isUpDown: boolean;
};

export const readUncompressedImage = async (params: Params) => {
  const { stream, converter, info, isUpDown } = params;
  const { width, depth } = getSizeAndDepth(info);
  const lineSize = calcPitch(width, depth);
  const alignedLineSize = calcPitch(width, depth, 4);
  const lineDelta = alignedLineSize - lineSize;
  const onRow = async (row: Uint8Array) => {
    await stream.readBuffer(row, lineSize);
    if (lineDelta) {
      await stream.skip(lineDelta);
    }
  };

  await readImage(
    converter,
    info,
    onRow,
    stdRowOrder(isUpDown ? "forward" : "backward")
  );
};
