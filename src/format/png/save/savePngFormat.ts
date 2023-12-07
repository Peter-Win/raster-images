import { FnSaveFormat } from "../../Driver";
import { saveSingleImageFormat } from "../../saveSingleImageFormat";
import { makeOptionsSavePng } from "./OptionsSavePng";
import { savePngImage } from "./savePngImage";

export const savePngFormat: FnSaveFormat = async (format, stream, options) => {
  await saveSingleImageFormat(
    format,
    stream,
    options,
    "PNG",
    makeOptionsSavePng,
    savePngImage
  );
};
