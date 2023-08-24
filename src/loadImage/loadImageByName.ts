import { FrameType, createFormatByName } from "../format";
import { Surface } from "../Surface";
import { RAStream } from "../stream";
import { TargetImageDescriptor } from "./TargetImageDescriptor";
import { loadImageFromFormat } from "./loadImageFromFormat";
import { ConverterProps } from "../Converter/ConverterProps";

export const loadImageByName = async (
  stream: RAStream,
  options?: {
    frameDef?: number | FrameType; // =0
    target?: TargetImageDescriptor;
    converterProps?: ConverterProps;
  }
): Promise<Surface> => {
  const format = await createFormatByName(stream);
  return loadImageFromFormat(format, options);
};
