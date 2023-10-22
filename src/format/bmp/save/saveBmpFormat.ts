import { PixelFormat } from "../../../PixelFormat";
import { OptionsCreateConverter } from "../../../Converter";
import { Surface } from "../../../Surface";
import { FormatForSave } from "../../FormatForSave";
import { RAStream } from "../../../stream";
import { ErrorRI } from "../../../utils";
import { saveBmpImage } from "./saveBmpImage";
import { makeOptionsSaveBmp } from "./OptionsSaveBmp";

/**
 * Это часть системы универсальной записи в файлы.
 * Вызывать эту функцию напрямую не рекомендуется.
 * Для прямого сохранения в BMP-формат рекомендуется saveBmpImage.
 * @param format
 * @param stream
 * @param options
 * @returns
 */
export const saveBmpFormat = async (
  format: FormatForSave,
  stream: RAStream,
  dstPixFmt?: PixelFormat,
  options?: OptionsCreateConverter
) => {
  const { frames } = format;
  if (frames.length !== 1) {
    throw new ErrorRI("Can't write <fmt> file with <n> frames", {
      fmt: "BMP",
      n: frames.length,
    });
  }
  const frame = frames[0]!;
  const surface: Surface = await frame.getImage();
  return saveBmpImage(
    surface,
    stream,
    { ...makeOptionsSaveBmp(frame.info.vars), dstPixFmt },
    options
  );
};
