import { Surface } from "../../../Surface";
import { RAStream } from "../../../stream";
import { OptionsTarga } from "../OptionsTarga";
import { OptionsCreateConverter, createRowsReader } from "../../../Converter";
import { PixelFormat } from "../../../PixelFormat";
import { saveTarga } from "./saveTarga";
import { compatibleTargaPixelFormat } from "../compatibleTargaPixelFormat";

type OptionsSaveTargaImage = OptionsTarga & {
  dstPixFmt?: PixelFormat;
};

export const saveTargaImage = async (
  surface: Surface,
  stream: RAStream,
  tgaOptions?: OptionsSaveTargaImage,
  converterOptions?: OptionsCreateConverter
): Promise<void> => {
  const { dstPixFmt, ...options } = tgaOptions ?? {};
  const tgaPixFmt = dstPixFmt
    ? compatibleTargaPixelFormat(dstPixFmt)
    : surface.info.fmt;
  const reader = await createRowsReader(surface, tgaPixFmt, converterOptions);
  await saveTarga(reader, stream, options, converterOptions?.progress);
};
