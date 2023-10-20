import { FrameType, createFormatByName } from "../format";
import { Surface } from "../Surface";
import { RAStream } from "../stream";
import { TargetImageDescriptor } from "./TargetImageDescriptor";
import { loadImageFromFormat } from "./loadImageFromFormat";
import { ConverterSearchProps } from "../Converter/search";
import { OnProgressInfo } from "../Converter/ProgressInfo";

export const loadImageByName = async (
  stream: RAStream,
  options?: {
    frameDef?: number | FrameType; // =0
    target?: TargetImageDescriptor;
    converterSearchProps?: ConverterSearchProps;
    progress?: OnProgressInfo;
  }
): Promise<Surface> => {
  const format = await createFormatByName(stream);
  return loadImageFromFormat(format, options);
};
