import {
  ConverterProps,
  defaultConverterProps,
} from "../Converter/ConverterProps";
import { findPath, buildConverterGraph } from "../Converter/ConverterGraph";
import { allConverters } from "../Converter/allConverters";
import { PixelFormat } from "../PixelFormat";
import { Surface } from "../Surface";
import { ErrorRI } from "../utils";
import { ImageReader } from "./ImageReader";
import { SurfaceReader } from "./SurfaceReader";
import { OldConverter } from "../Converter";
import { OnProgressInfo } from "./ProgressInfo";

export const createImageReader = (
  srcPixFmt: PixelFormat,
  dstImage: Surface,
  options?: {
    converterProps?: ConverterProps;
    progress?: OnProgressInfo;
  }
): ImageReader => {
  const dstPixFmt = dstImage.info.fmt;
  if (srcPixFmt.equals(dstPixFmt)) {
    return new SurfaceReader(dstImage);
  }
  const srcSignNeed = srcPixFmt.signature;
  const dstSignNeed = dstImage.info.fmt.signature;
  const graph = buildConverterGraph(
    options?.converterProps ?? defaultConverterProps,
    allConverters
  );
  const converters = findPath(srcSignNeed, dstSignNeed, graph);
  if (converters.length === 0) {
    throw new ErrorRI("Can't find pixel converter from <src> to <dst>", {
      src: String(srcPixFmt),
      dst: String(dstPixFmt),
    });
  }
  return converters.reduceRight(
    (prevReader: ImageReader, converter: OldConverter) =>
      converter.createReader(prevReader, options?.progress),
    new SurfaceReader(dstImage)
  );
};
