import { FrameType, createFormatByName } from "../format";
import { Surface } from "../Surface";
import { RAStream } from "../stream";
import { TargetImageDescriptor } from "./TargetImageDescriptor";
import { loadImageFromFormat } from "./loadImageFromFormat";
import { ConverterProps } from "../Converter/ConverterProps";
import { OnProgressInfo } from "../transfer/ProgressInfo";

export const loadImageByName = async (
  stream: RAStream,
  options?: {
    frameDef?: number | FrameType; // =0
    target?: TargetImageDescriptor;
    converterProps?: ConverterProps;
    progress?: OnProgressInfo;
  }
): Promise<Surface> => {
  const format = await createFormatByName(stream);
  return loadImageFromFormat(format, options);
};
