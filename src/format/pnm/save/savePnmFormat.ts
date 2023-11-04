import { saveSingleImageFormat } from "../../saveSingleImageFormat";
import { OptionsSave } from "../../Driver";
import { RAStream } from "../../../stream";
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
  options?: OptionsSave
) => {
  await saveSingleImageFormat(
    format,
    stream,
    options,
    "PNM",
    makeOptionsSavePnm,
    savePnmImage
  );
};
