import { RAStream } from "../../stream";
import { BitmapFormat } from "../BitmapFormat";
import { Driver } from "../Driver";
import { FormatPsd } from "./FormatPsd";
import { detectPsd } from "./detectPsd";

export const driverPsd: Driver = {
  name: "Adobe Photoshop",
  shortName: "PSD" as const,
  extensions: ["psd"] as const,
  props: new Set(["multiFrame", "multiSize"] as const),

  detect: detectPsd,

  createFormat: (stream: RAStream): Promise<BitmapFormat> =>
    FormatPsd.create(stream),
};
