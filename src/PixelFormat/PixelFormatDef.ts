import { PixelDepth } from "../types";
import { ColorModel } from "../ColorModel";
import { Palette } from "../Palette/Palette";

export interface PixelFormatDef {
  colorModel: ColorModel;
  depth: PixelDepth;
  palette?: Readonly<Palette>;
  alpha?: boolean;
}
