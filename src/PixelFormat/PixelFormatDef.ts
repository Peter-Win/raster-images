import { PixelDepth } from "../types";
import { ColorModel } from "../ColorModel";
import { Palette } from "../Palette";

export interface PixelFormatDef {
  colorModel: ColorModel;
  depth: PixelDepth;
  palette?: Palette;
  alpha?: boolean;
}
