import { RAStream } from "../../../stream";
import { createRowsReader } from "../../../Converter";
import { Surface } from "../../../Surface";
import { OptionsSave } from "../../Driver";
import { compatiblePngPixelFormat } from "./compatiblePngPixelFormat";
import { OptionsSavePng } from "./OptionsSavePng";
import { savePng } from "./savePng";

/**
 * Эту функцию рекомендуется использовать, если нужно целенаправленно использовать запись в PNG-формате.
 * @param surface
 * @param stream
 * @param pngOptions Параметры, специфичные для PNG-формата
 * @param converterOptions
 */
export const savePngImage = async (
  surface: Surface,
  stream: RAStream,
  pngOptions?: OptionsSavePng,
  saveOptions?: OptionsSave
) => {
  const { dstPixFmt, ...converterOptions } = saveOptions ?? {};
  const bmpPixFmt = compatiblePngPixelFormat(dstPixFmt ?? surface.info.fmt);
  const reader = await createRowsReader(surface, bmpPixFmt, converterOptions);
  await savePng(reader, stream, pngOptions, converterOptions.progress);
};
