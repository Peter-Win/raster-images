import { Sample } from "../Sample";
import { PixelFormatDef } from "./PixelFormatDef";

export type ParcelPixelFormat = {
  def: PixelFormatDef;
  samples: Sample[];
};
