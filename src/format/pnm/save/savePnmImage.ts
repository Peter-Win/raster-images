import { RAStream } from "../../../stream";
import { Surface } from "../../../Surface";
import { PixelFormat } from "../../../PixelFormat";
import { OptionsSavePnm } from "./OptionsSavePnm";
import { OptionsCreateConverter, createRowsReader } from "../../../Converter";
import { compatiblePnmPixelFormat } from "../compatiblePnmPixelFormat";
import { savePnm } from "./savePnm";

export type OptionsSavePnmImage = OptionsSavePnm & {
  dstPixFmt?: PixelFormat;
};

export const savePnmImage = async (
  image: Surface,
  stream: RAStream,
  options?: OptionsSavePnmImage,
  converterOptions?: OptionsCreateConverter
) => {
  const { dstPixFmt, ...restOptions } = options ?? {};
  const pnmPixFmt = compatiblePnmPixelFormat(dstPixFmt ?? image.info.fmt);
  const reader = await createRowsReader(image, pnmPixFmt, converterOptions);
  await savePnm(reader, stream, restOptions, converterOptions?.progress);
};
