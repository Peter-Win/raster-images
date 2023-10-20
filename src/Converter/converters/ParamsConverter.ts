import { PixelFormat } from "../../PixelFormat";
import { ImageInfo } from "../../ImageInfo";
import { Point } from "../../math/Point";
import { Converter } from "../Converter";
import { OnProgressInfo } from "../ProgressInfo";

/**
 * Общие параметры для всех промежуточных конвертеров
 */
export interface ParamsConverter {
  nextConverter: Converter;
  size: Point;
  srcSign: string;
  dstSign: string;
  makeDstInfo?(srcInfo: ImageInfo, dstSign: string): ImageInfo;
  progress?: OnProgressInfo;
}

export const makeDstInfoStd = (
  srcInfo: ImageInfo,
  { dstSign, makeDstInfo }: ParamsConverter
): ImageInfo =>
  makeDstInfo?.(srcInfo, dstSign) ?? {
    size: srcInfo.size,
    fmt: new PixelFormat(dstSign),
  };
