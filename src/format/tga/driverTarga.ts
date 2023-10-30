import { RAStream } from "../../stream";
import { Driver } from "../Driver";
import { targaName } from "./targaCommon";
import { BitmapFormat } from "../BitmapFormat";
import { FormatTarga } from "./FormatTarga";
import { targaDetect } from "./targaDetect";

export const driverTarga: Driver = {
  name: targaName,
  shortName: "TGA" as const,
  extensions: ["tga"] as const,
  props: new Set(),

  detect: targaDetect,

  createFormat: (stream: RAStream): Promise<BitmapFormat> =>
    FormatTarga.create(stream),
};
