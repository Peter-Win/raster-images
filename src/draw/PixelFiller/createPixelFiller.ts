import { ErrorRI } from "../../utils";
import { PixelFormat } from "../../PixelFormat";
import { PixelFiller } from "./PixelFiller";
import { pixelFiller1 } from "./pixelFiller1";
import { pixelFiller4 } from "./pixelFiller4";
import { pixelFiller8 } from "./pixelFiller8";
import { pixelFillerN } from "./pixelFillerN";

export const createPixelFiller = (pixelFormat: PixelFormat): PixelFiller => {
  const { depth } = pixelFormat;
  switch (depth) {
    case 1:
      return pixelFiller1;
    case 4:
      return pixelFiller4;
    case 8:
      return pixelFiller8;
    default:
      if ((depth & 7) !== 0) {
        throw new ErrorRI("Cant create pixel filler for <s>", {
          s: pixelFormat.signature,
        });
      }
      return pixelFillerN(depth >> 3);
  }
};
