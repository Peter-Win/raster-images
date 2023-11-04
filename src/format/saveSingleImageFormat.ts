import { RAStream } from "../stream";
import { FormatForSave } from "./FormatForSave";
import { OptionsSave } from "./Driver";
import { ErrorRI } from "../utils";
import { Surface } from "../Surface";
import { Variables } from "../ImageInfo/Variables";

export const saveSingleImageFormat = async <OptionsFmt>(
  format: FormatForSave,
  stream: RAStream,
  options: OptionsSave | undefined,
  formatName: string,
  makeFmtOptions: (vars?: Variables) => OptionsFmt | undefined,
  saveFmtImage: (
    surface: Surface,
    stream: RAStream,
    fmtOptions?: OptionsFmt,
    saveOptions?: OptionsSave
  ) => Promise<void>
): Promise<void> => {
  const { frames } = format;
  if (frames.length !== 1) {
    throw new ErrorRI("Can't write <fmt> file with <n> frames", {
      fmt: formatName,
      n: frames.length,
    });
  }
  const frame = frames[0]!;
  const surface: Surface = await frame.getImage();
  await saveFmtImage(surface, stream, makeFmtOptions(frame.info.vars), options);
};
