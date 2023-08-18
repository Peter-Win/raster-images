import { FrameType, createFormatByName } from "../format";
import { Surface } from "../Surface";
import { RAStream } from "../stream";
import { TargetImageDescriptor } from "./TargetImageDescriptor";
import { loadImageFromFormat } from "./loadImageFromFormat";

export const loadImageByName = async (
  stream: RAStream,
  frameDef: number | FrameType = 0,
  targetDef: TargetImageDescriptor = undefined
): Promise<Surface> => {
  const format = await createFormatByName(stream);
  return loadImageFromFormat(format, frameDef, targetDef);
};
