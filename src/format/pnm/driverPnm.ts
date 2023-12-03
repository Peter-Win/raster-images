import { RAStream } from "../../stream";
import { Driver } from "../Driver";
import { pnmName } from "./pnmCommon";
import { BitmapFormat } from "../BitmapFormat";
import { FormatPnm } from "./FormatPnm";

export const driverPnm: Driver = {
  name: pnmName,
  shortName: "PNM" as const,
  extensions: ["pnm", "pbm", "pgm", "ppm", "pfm"] as const,
  props: new Set(),

  detect: async (stream: RAStream): Promise<boolean> => {
    if ((await stream.getSize()) < 2) return false;
    await stream.seek(0);
    const sign = await stream.read(2);
    return sign[0] === 0x42 && sign[1] === 0x4d;
  },

  createFormat: (stream: RAStream): Promise<BitmapFormat> =>
    FormatPnm.create(stream),
};
