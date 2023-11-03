import { Surface } from "../../../Surface";
import { RAStream } from "../../../stream";
import { OptionsTarga } from "../OptionsTarga";
import { createRowsReader } from "../../../Converter";
import { saveTarga } from "./saveTarga";
import { compatibleTargaPixelFormat } from "../compatibleTargaPixelFormat";
import { OptionsSave } from "../../Driver";

export const saveTargaImage = async (
  surface: Surface,
  stream: RAStream,
  tgaOptions?: OptionsTarga,
  saveOptions?: OptionsSave
): Promise<void> => {
  const { dstPixFmt, ...cvtOptions } = saveOptions || {};
  const tgaPixFmt = dstPixFmt
    ? compatibleTargaPixelFormat(dstPixFmt)
    : surface.info.fmt;
  const reader = await createRowsReader(surface, tgaPixFmt, cvtOptions);
  await saveTarga(reader, stream, tgaOptions, cvtOptions.progress);
};
