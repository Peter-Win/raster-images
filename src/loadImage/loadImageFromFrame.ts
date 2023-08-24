import { createImageReader } from "../transfer/createImageReader";
import { BitmapFrame } from "../format";
import { Surface } from "../Surface";
import { createSurfaceFromDescriptor } from "./createSurfaceFromDescriptor";
import { TargetImageDescriptor } from "./TargetImageDescriptor";
import { ConverterProps } from "../Converter/ConverterProps";

export const loadImageFromFrame = async (
  frame: BitmapFrame,
  options?: {
    target?: TargetImageDescriptor;
    converterProps?: ConverterProps;
  }
): Promise<Surface> => {
  const { info } = frame;
  const { target, converterProps } = options ?? {};
  const targetImage = createSurfaceFromDescriptor(info, target);
  const imageReader = createImageReader(info.fmt, targetImage, {
    converterProps,
  });
  await frame.read(imageReader);
  return targetImage;
};
