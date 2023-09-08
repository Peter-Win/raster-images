import { createImageReader } from "../transfer/createImageReader";
import { BitmapFrame } from "../format";
import { Surface } from "../Surface";
import { createSurfaceFromDescriptor } from "./createSurfaceFromDescriptor";
import { TargetImageDescriptor } from "./TargetImageDescriptor";
import { ConverterProps } from "../Converter/ConverterProps";
import { OnProgressInfo } from "../transfer/ProgressInfo";

export const loadImageFromFrame = async (
  frame: BitmapFrame,
  options?: {
    target?: TargetImageDescriptor;
    converterProps?: ConverterProps;
    progress?: OnProgressInfo;
  }
): Promise<Surface> => {
  const { info } = frame;
  const { target, converterProps, progress } = options ?? {};
  const targetImage = createSurfaceFromDescriptor(info, target);
  const imageReader = createImageReader(info.fmt, targetImage, {
    converterProps,
    progress,
  });
  await frame.read(imageReader);
  return targetImage;
};
