import { ErrorRI } from "../utils";
import { Surface } from "../Surface";
import { BitmapFormat, FrameType } from "../format";
import { TargetImageDescriptor } from "./TargetImageDescriptor";
import { loadImageFromFrame } from "./loadImageFromFrame";
import { ConverterSearchProps } from "../Converter/search";
import { OnProgressInfo } from "../Converter/ProgressInfo";

export const loadImageFromFormat = async (
  format: BitmapFormat,
  options?: {
    frameDef?: number | FrameType;
    target?: TargetImageDescriptor;
    converterSearchProps?: ConverterSearchProps;
    progress?: OnProgressInfo;
  }
): Promise<Surface> => {
  const { frameDef = 0, ...restOptions } = options ?? {};
  const [frame, msg] =
    typeof frameDef === "number"
      ? [format.frames[frameDef], "#"]
      : [format.frames.find(({ type }) => type === frameDef), "with type="];
  if (!frame)
    throw new ErrorRI("Not found frame <msg><fr>", {
      msg,
      fr: JSON.stringify(frameDef),
    });
  return loadImageFromFrame(frame, restOptions);
};
