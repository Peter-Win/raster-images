import { OptionsCreateConverter, createRowsReader } from "../../../Converter";
import { PixelFormat } from "../../../PixelFormat";
import { Surface } from "../../../Surface";
import { RAStream } from "../../../stream";
import { compatibleBmpPixelFormat } from "../compatibleBmpPixelFormat";
import { OptionsSaveBmp } from "./OptionsSaveBmp";
import { saveBmp } from "./saveBmp";

type OptionsSaveBmpImage = OptionsSaveBmp & {
  dstPixFmt?: PixelFormat;
};

/**
 * Эту функцию рекомендуется использовать, если нужно целенаправленно использовать запись в BMP-формате.
 * @param surface
 * @param stream
 * @param bmpOptions Параметры, специфичные для BMP-формата
 * @param converterOptions
 */
export const saveBmpImage = async (
  surface: Surface,
  stream: RAStream,
  bmpOptions?: OptionsSaveBmpImage,
  converterOptions?: OptionsCreateConverter
) => {
  const { dstPixFmt, ...restOptions } = bmpOptions || {};
  const bmpPixFmt = compatibleBmpPixelFormat(dstPixFmt ?? surface.info.fmt);
  const reader = await createRowsReader(surface, bmpPixFmt, converterOptions);
  await saveBmp(reader, stream, restOptions, converterOptions?.progress);
};
