import { RAStream } from "../../stream";
import { Driver } from "../Driver";
import { BitmapFormat } from "../BitmapFormat";
import { FormatBmp } from "./FormatBmp";
import { bmpWindows } from "./bmpCommon";

export const driverBmp: Driver = {
  name: bmpWindows,
  shortName: "BMP" as const,
  extensions: ["bmp", "dib", "rle"] as const,
  props: new Set(),

  detect: async (stream: RAStream): Promise<boolean> => {
    if ((await stream.getSize()) < 2) return false;
    await stream.seek(0);
    const sign = await stream.read(2);
    return sign[0] === 0x42 && sign[1] === 0x4d;
  },

  createFormat: (stream: RAStream): Promise<BitmapFormat> =>
    FormatBmp.create(stream),

  // save: (format): Promise<void> => saveBmp(format),
};
