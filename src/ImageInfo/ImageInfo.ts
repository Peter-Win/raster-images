import { PixelFormat } from "../PixelFormat";
import { PixelDepth } from "../types";
import { ColorModel } from "../ColorModel";
import { Palette } from "../Palette/Palette";
import { Point } from "../math/Point";
import { Variables, copyVars } from "./Variables";
import { calcPitch } from "./calcPitch";

export interface ImageInfo {
  size: Point;
  fmt: PixelFormat;
  vars?: Variables;
  pitch?: number;
}

/* eslint "default-param-last": "off" */

export const createInfoSize = (
  size: Point,
  depth: PixelDepth,
  colorModel: ColorModel = "Auto",
  alpha?: boolean,
  palette?: Palette
): ImageInfo => ({
  size,
  fmt: new PixelFormat({ depth, colorModel, alpha, palette }),
});

export const createInfo = (
  width: number,
  height: number,
  depth: PixelDepth,
  colorModel: ColorModel = "Auto",
  alpha?: boolean,
  palette?: Palette
): ImageInfo =>
  createInfoSize(new Point(width, height), depth, colorModel, alpha, palette);

export const createInfoSign = (
  width: number,
  height: number,
  signature: string
): ImageInfo => ({
  size: new Point(width, height),
  fmt: new PixelFormat(signature),
});

export const getImageLineSize = ({ pitch, size, fmt }: ImageInfo): number =>
  pitch ?? calcPitch(size.x, fmt.depth);

export const copyImageInfo = (src: ImageInfo): ImageInfo => ({
  size: src.size.clone(),
  fmt: src.fmt, // immutable object
  vars: src.vars && copyVars(src.vars),
  pitch: src.pitch,
});
