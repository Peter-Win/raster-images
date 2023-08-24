import { dump } from "../../utils";
import { RAStream } from "../../stream";
import { BitmapFormat } from "../BitmapFormat";
import { Driver } from "../Driver";
import { FormatGif } from "./FormatGif";

export const driverGif: Driver = {
  name: "CompuServe GIF",
  shortName: "GIF" as const,
  extensions: ["gif"] as const,
  props: new Set(),

  detect: async (stream: RAStream): Promise<boolean> => {
    const streamSize = await stream.getSize();
    if (streamSize < 13) return false;
    await stream.seek(0);
    const buf = await stream.read(3);
    return dump(buf) === "47 49 46"; // GIF
  },

  createFormat: (stream: RAStream): Promise<BitmapFormat> =>
    FormatGif.create(stream),

  // save: (format): Promise<void> => saveBmp(format),
};
