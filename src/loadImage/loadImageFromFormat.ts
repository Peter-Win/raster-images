import { ErrorRI } from "../utils";
import { Surface } from "../Surface";
import { BitmapFormat, FrameType } from "../format";
import { TargetImageDescriptor } from "./TargetImageDescriptor";
import { loadImageFromFrame } from "./loadImageFromFrame";

export const loadImageFromFormat = (
  format: BitmapFormat,
  frameDef: number | FrameType,
  targetDef?: TargetImageDescriptor
): Promise<Surface> => {
  const [frame, msg] =
    typeof frameDef === "number"
      ? [format.frames[frameDef], "#"]
      : [format.frames.find(({ type }) => type === frameDef), "with type="];
  if (!frame)
    throw new ErrorRI("Not found frame <msg><fr>", {
      msg,
      fr: JSON.stringify(frameDef),
    });
  return loadImageFromFrame(frame, targetDef);
};
