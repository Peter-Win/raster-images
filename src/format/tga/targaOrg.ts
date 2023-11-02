import { Point } from "../../math";
import { OptionsTarga } from "./OptionsTarga";
import { TargaHeader } from "./TargaHeader";

// for Targa the origin is in the **lower left** corner, and for raster-images it is in the upper left.

export const orgFromTarga = (
  {
    width,
    height,
    x0,
    y0,
  }: Pick<TargaHeader, "width" | "height" | "x0" | "y0">,
  { top2bottom, right2left }: Pick<OptionsTarga, "top2bottom" | "right2left">
) => ({
  orgX: right2left ? width - x0 : x0,
  orgY: top2bottom ? height - y0 : y0,
});

export const orgAndSizeToTarga = (
  { x: width, y: height }: Point,
  { orgX = 0, orgY = 0, top2bottom, right2left }: OptionsTarga
): Pick<TargaHeader, "x0" | "y0" | "width" | "height"> => ({
  x0: right2left ? width - orgX : orgX,
  y0: top2bottom ? height - orgY : orgY,
  width,
  height,
});
