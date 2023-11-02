import { PixelFormat } from "../../../PixelFormat";
import { OptionsCreateConverter } from "../../../Converter";
import { Surface } from "../../../Surface";
import { FormatForSave } from "../../FormatForSave";
import { RAStream } from "../../../stream";
import { ErrorRI } from "../../../utils";
import { saveTargaImage } from "./saveTargaImage";
import { targaOptionsFromVars } from "../OptionsTarga";

export const saveTargaFormat = async (
  format: FormatForSave,
  stream: RAStream,
  dstPixFmt?: PixelFormat,
  options?: OptionsCreateConverter
) => {
  const { frames } = format;
  if (frames.length !== 1) {
    throw new ErrorRI("Can't write <fmt> file with <n> frames", {
      fmt: "Targa",
      n: frames.length,
    });
  }
  const frame = frames[0]!;
  const surface: Surface = await frame.getImage();
  return saveTargaImage(
    surface,
    stream,
    { ...targaOptionsFromVars(frame.info.vars), dstPixFmt },
    options
  );
};
