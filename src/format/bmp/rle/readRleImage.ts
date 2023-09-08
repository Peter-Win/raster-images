import { ImageReader } from "../../../transfer/ImageReader";
import { ImageInfo } from "../../../ImageInfo";
import { ErrorRI } from "../../../utils";
import { FnRleUnpack, RleContext, Res } from "./rleTypes";
import { unpackRle8 } from "./unpackRle8";
import { unpackRle4 } from "./unpackRle4";
import { readLoop } from "../../../transfer/readLoop";
import { stdRowOrder } from "../../../transfer/rowOrder";

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

  await readLoop({
    reader,
    info,
    rowOrder: stdRowOrder(isUpDown ? "forward" : "backward"),
    onRow: async (row) => {
      row.fill(0);
      if (ctx.res !== Res.endOfImage) {
        if (ctx.y > 1) {
          ctx.y--;
        } else {
          srcPos = unpack(srcData, srcPos, row, ctx);
        }
      }
    },
  });
};
