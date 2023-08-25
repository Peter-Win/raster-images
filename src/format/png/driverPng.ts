import { RAStream } from "../../stream";
import { BitmapFormat } from "../BitmapFormat";
import { Driver } from "../Driver";
import { FormatPng } from "./FormatPng";
import { checkPngSignature } from "./checkPngSignature";

export const driverPng: Driver = {
  name: "Portable Network Graphics (PNG)",
  shortName: "PNG" as const,
  extensions: ["png"] as const,
  props: new Set(),

  detect: (stream: RAStream): Promise<boolean> => checkPngSignature(stream),

  createFormat: (stream: RAStream): Promise<BitmapFormat> =>
    FormatPng.create(stream),
};
