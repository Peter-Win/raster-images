import { OptionsCreateConverter } from "../../../Converter";
import { PixelFormat } from "../../../PixelFormat";
import { Surface } from "../../../Surface";
import { RAStream } from "../../../stream";
import { ErrorRI } from "../../../utils";
import { FormatForSave } from "../../FormatForSave";
import { makeOptionsSavePnm } from "./OptionsSavePnm";
import { savePnmImage } from "./savePnmImage";

/**
 * Часть системы универсальной записи в растровые форматы.
 * Не рекомендуется для прямого использования.
 * Если нужно напрямую работать с PNM-форматом, рекомендуется использовать savePnmImage
 * @param format
 * @param stream
 * @param dstPixFmt
 * @param options
 * @returns
 */
export const savePnmFormat = async (
  format: FormatForSave,
  stream: RAStream,
  dstPixFmt?: PixelFormat,
  options?: OptionsCreateConverter
) => {
  const { frames } = format;
  if (frames.length !== 1) {
    throw new ErrorRI("Can't write <fmt> file with <n> frames", {
      fmt: "PNM",
      n: frames.length,
    });
  }
  const frame = frames[0]!;
  const surface: Surface = await frame.getImage();
  return savePnmImage(
    surface,
    stream,
    { ...makeOptionsSavePnm(frame.info.vars), dstPixFmt },
    options
  );
};
