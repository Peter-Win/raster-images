import { OptionsSave } from "../../Driver";
import { createRowsReader } from "../../../Converter";
import { Surface } from "../../../Surface";
import { RAStream } from "../../../stream";
import { compatibleBmpPixelFormat } from "../compatibleBmpPixelFormat";
import { OptionsSaveBmp } from "./OptionsSaveBmp";
import { saveBmp } from "./saveBmp";

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
  bmpOptions?: OptionsSaveBmp,
  saveOptions?: OptionsSave
) => {
  const { dstPixFmt, ...converterOptions } = saveOptions ?? {};
  const bmpPixFmt = compatibleBmpPixelFormat(dstPixFmt ?? surface.info.fmt);
  const reader = await createRowsReader(surface, bmpPixFmt, converterOptions);
  await saveBmp(reader, stream, bmpOptions, converterOptions.progress);
};
