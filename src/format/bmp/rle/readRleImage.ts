import { Converter, readImage } from "../../../Converter";
import { ImageInfo } from "../../../ImageInfo";
import { ErrorRI } from "../../../utils";
import { FnRleUnpack, RleContext, Res } from "./rleTypes";
import { unpackRle8 } from "./unpackRle8";
import { unpackRle4 } from "./unpackRle4";
import { stdRowOrder } from "../../../Converter/rowOrder";

type Params = {
  srcData: Uint8Array;
  converter: Converter;
  info: ImageInfo;
  isUpDown: boolean;
};

const unpackDict: Record<number, FnRleUnpack> = {
  4: unpackRle4,
  8: unpackRle8,
};

export const readRleImage = async (params: Params): Promise<void> => {
  const { srcData, converter, info, isUpDown } = params;
  const { depth } = info.fmt;
  const unpack = unpackDict[depth];
  if (!unpack) {
    throw new ErrorRI("Invalid RLE method for <depth> bit/pixel", { depth });
  }

  const ctx: RleContext = {
    x: 0,
    y: 0,
    res: Res.endOfLine,
  };
  let srcPos = 0;
  const onRow = async (row: Uint8Array) => {
    row.fill(0);
    if (ctx.res !== Res.endOfImage) {
      if (ctx.y > 1) {
        ctx.y--;
      } else {
        srcPos = unpack(srcData, srcPos, row, ctx);
      }
    }
  };
  await readImage(
    converter,
    info,
    onRow,
    stdRowOrder(isUpDown ? "forward" : "backward")
  );
};
