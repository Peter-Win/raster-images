import { saveSingleImageFormat } from "../../saveSingleImageFormat";
import { FormatForSave } from "../../FormatForSave";
import { RAStream } from "../../../stream";
import { saveTargaImage } from "./saveTargaImage";
import { targaOptionsFromVars } from "../OptionsTarga";
import { OptionsSave } from "../../Driver";

export const saveTargaFormat = async (
  format: FormatForSave,
  stream: RAStream,
  options?: OptionsSave
) => {
  await saveSingleImageFormat(
    format,
    stream,
    options,
    "Targa",
    targaOptionsFromVars,
    saveTargaImage
  );
};
