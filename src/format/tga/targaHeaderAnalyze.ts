import { ImageInfo } from "../../ImageInfo";
import {
  TargaHeader,
  TargaImageDescriptor,
  TargaImageType,
} from "./TargaHeader";
import { OptionsTarga, targaOptionsToVars } from "./OptionsTarga";
import { Point } from "../../math";
import { PixelFormat, PixelFormatDef } from "../../PixelFormat";
import { ColorModel } from "../../ColorModel";
import { ErrorRI } from "../../utils";

type Details = {
  colorModel: ColorModel;
  rle: boolean;
};
const typeMap: Record<TargaImageType, Details | null> = {
  [TargaImageType.noImageData]: null,
  [TargaImageType.uncompressedColorMapped]: {
    colorModel: "Indexed",
    rle: false,
  },
  [TargaImageType.uncompressedTrueColor]: { colorModel: "RGB", rle: false },
  [TargaImageType.uncompressedGray]: { colorModel: "Gray", rle: false },
  [TargaImageType.rleColorMapped]: { colorModel: "Indexed", rle: true },
  [TargaImageType.rleTrueColor]: { colorModel: "RGB", rle: true },
};

export const targaHeaderAnalyze = (
  header: TargaHeader
): {
  info: ImageInfo;
  options: OptionsTarga;
} => {
  const { width, height, depth, imageType, imageDescriptor, x0, y0 } = header;

  const details = typeMap[imageType];
  if (details === undefined) throw new ErrorRI("Invalid Targa image type");
  if (details === null) throw new ErrorRI("No image data included");
  const { colorModel, rle } = details;
  const options: OptionsTarga = {
    compression: rle,
    right2left: !!(imageDescriptor & TargaImageDescriptor.right2left),
    top2bottom: !!(imageDescriptor & TargaImageDescriptor.top2bottom),
  };
  // for Targa the origin is in the **lower left** corner, and for raster-images it is in the upper left.
  const orgX = options.right2left ? width - x0 : x0;
  const orgY = options.top2bottom ? height - y0 : y0;
  if (orgX !== 0 || orgY !== 0) {
    options.orgX = orgX;
    options.orgY = orgY;
  }
  const def: PixelFormatDef = {
    colorModel,
    depth: depth === 16 ? 15 : depth, // 16 bpp -> 15
    alpha: depth === 32, // от attrMask пришлось отказаться, т.к. там часто указано 8 при отсутствии альфы
  };

  const info: ImageInfo = {
    size: new Point(width, height),
    fmt: new PixelFormat(def),
    vars: targaOptionsToVars(options),
  };
  return { info, options };
};
