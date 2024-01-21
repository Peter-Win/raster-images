import { RAStream } from "../../stream";
import { BitmapFormat } from "../BitmapFormat";
import { Driver } from "../Driver";
import { FormatProps } from "../FormatProps";
import { FormatTiff } from "./FormatTiff";
import { checkTiffFormat } from "./TiffFileHeader";

export const driverTiff: Driver = {
  name: "Tagged Image File Format (TIFF)",
  shortName: "TIFF" as const,
  extensions: ["tif", "tiff"] as const,
  props: new Set<FormatProps>([
    "multiFrame",
    "multiPal",
    "multiSize",
    "multiDepth",
  ]),

  detect: (stream: RAStream): Promise<boolean> => checkTiffFormat(stream),

  createFormat: (stream: RAStream): Promise<BitmapFormat> =>
    FormatTiff.create(stream),
};
