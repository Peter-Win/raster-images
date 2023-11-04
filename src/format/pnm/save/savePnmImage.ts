import { OptionsSave } from "../../Driver";
import { RAStream } from "../../../stream";
import { Surface } from "../../../Surface";
import { OptionsSavePnm } from "./OptionsSavePnm";
import { createRowsReader } from "../../../Converter";
import { compatiblePnmPixelFormat } from "../compatiblePnmPixelFormat";
import { savePnm } from "./savePnm";

export const savePnmImage = async (
  image: Surface,
  stream: RAStream,
  pnmOptions?: OptionsSavePnm,
  saveOptions?: OptionsSave
) => {
  const { dstPixFmt, ...cvtOptions } = saveOptions ?? {};
  const pnmPixFmt = compatiblePnmPixelFormat(dstPixFmt ?? image.info.fmt);
  const reader = await createRowsReader(image, pnmPixFmt, cvtOptions);
  await savePnm(reader, stream, pnmOptions, cvtOptions?.progress);
};
