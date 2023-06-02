import { ImageReader } from "../../../transfer/ImageReader";
import { ImageInfo } from "../../../ImageInfo";
import { getSizeAndDepth } from "../../../ImageInfo/getSizeAndDepth";
import { ErrorRI } from "../../../utils";
import { FnRleUnpack, RleContext, Res } from "./rleTypes";
import { unpackRle8 } from "./unpackRle8";
import { unpackRle4 } from "./unpackRle4";

type Params = {
  srcData: Uint8Array;
  reader: ImageReader;
  info: ImageInfo;
  isUpDown: boolean;
};

const unpackDict: Record<number, FnRleUnpack> = {
  4: unpackRle4,
  8: unpackRle8,
};

export const readRleImage = async (params: Params): Promise<void> => {
  const { srcData, reader, info, isUpDown } = params;
  const { height, depth } = getSizeAndDepth(info);
  const unpack = unpackDict[depth];
  if (!unpack) {
    throw new ErrorRI("Invalid RLE method for <depth> bit/pixel", { depth });
  }

  const deltaY = isUpDown ? 1 : -1;
  let lineIndex: number = isUpDown ? 0 : height - 1;

  const ctx: RleContext = {
    x: 0,
    y: 0,
    res: Res.endOfLine,
  };
  let srcPos = 0;
  for (let j = 0; j < height; j++) {
    const dstBuf = await reader.getRowBuffer(lineIndex);
    dstBuf.fill(0);
    if (ctx.res !== Res.endOfImage) {
      if (ctx.y > 1) {
        ctx.y--;
      } else {
        srcPos = unpack(srcData, srcPos, dstBuf, ctx);
      }
    }
    if (reader.finishRow) {
      await reader.finishRow(lineIndex);
    }
    lineIndex += deltaY;
  }
};
