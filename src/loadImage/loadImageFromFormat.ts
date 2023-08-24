import { ErrorRI } from "../utils";
import { Surface } from "../Surface";
import { BitmapFormat, FrameType } from "../format";
import { TargetImageDescriptor } from "./TargetImageDescriptor";
import { loadImageFromFrame } from "./loadImageFromFrame";
import { ConverterProps } from "../Converter/ConverterProps";

export const loadImageFromFormat = (
  format: BitmapFormat,
  options?: {
    frameDef?: number | FrameType;
    target?: TargetImageDescriptor;
    converterProps?: ConverterProps;
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
