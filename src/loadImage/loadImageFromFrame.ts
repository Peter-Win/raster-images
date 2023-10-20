import { BitmapFrame } from "../format";
import { Surface } from "../Surface";
import { createSurfaceFromDescriptor } from "./createSurfaceFromDescriptor";
import { TargetImageDescriptor } from "./TargetImageDescriptor";
import { OnProgressInfo } from "../Converter/ProgressInfo";
import { createConverterForRead } from "../Converter";
import { ConverterSearchProps } from "../Converter/search";

export const loadImageFromFrame = async (
  frame: BitmapFrame,
  options?: {
    target?: TargetImageDescriptor;
    converterSearchProps?: ConverterSearchProps;
    progress?: OnProgressInfo;
  }
): Promise<Surface> => {
  const { info } = frame;
  const { target, converterSearchProps, progress } = options ?? {};
  const targetImage = createSurfaceFromDescriptor(info, target);
  const imageReader = createConverterForRead(info.fmt, targetImage, {
    converterSearchProps,
    progress,
  });
  await frame.read(imageReader);
  return targetImage;
};
