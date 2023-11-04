import { saveSingleImageFormat } from "../../saveSingleImageFormat";
import { FormatForSave } from "../../FormatForSave";
import { RAStream } from "../../../stream";
import { saveBmpImage } from "./saveBmpImage";
import { makeOptionsSaveBmp } from "./OptionsSaveBmp";
import { OptionsSave } from "../../Driver";

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
  options?: OptionsSave
) => {
  await saveSingleImageFormat(
    format,
    stream,
    options,
    "BMP",
    makeOptionsSaveBmp,
    saveBmpImage
  );
};
