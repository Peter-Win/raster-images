import { saveSingleImageFormat } from "../../saveSingleImageFormat";
import { saveBmpImage } from "./saveBmpImage";
import { makeOptionsSaveBmp } from "./OptionsSaveBmp";
import { FnSaveFormat } from "../../Driver";

/**
 * Это часть системы универсальной записи в файлы.
 * Вызывать эту функцию напрямую не рекомендуется.
 * Для прямого сохранения в BMP-формат рекомендуется saveBmpImage.
 * @param {FormatForSave} format
 * @param stream
 * @param {OptionsSave} options
 * @returns
 */
export const saveBmpFormat: FnSaveFormat = async (format, stream, options) => {
  await saveSingleImageFormat(
    format,
    stream,
    options,
    "BMP",
    makeOptionsSaveBmp,
    saveBmpImage
  );
};
