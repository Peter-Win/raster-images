import { createImageReader } from "../transfer/createImageReader";
import { BitmapFrame } from "../format";
import { Surface } from "../Surface";
import { createSurfaceFromDescriptor } from "./createSurfaceFromDescriptor";
import { TargetImageDescriptor } from "./TargetImageDescriptor";

export const loadImageFromFrame = async (
  frame: BitmapFrame,
  targetDef?: TargetImageDescriptor
): Promise<Surface> => {
  const { info } = frame;
  const targetImage = createSurfaceFromDescriptor(info, targetDef);
  const imageReader = createImageReader(info.fmt, targetImage);
  await frame.read(imageReader);
  return targetImage;
};
