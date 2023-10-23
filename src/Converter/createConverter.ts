import { Surface } from "../Surface";
import { PixelFormat } from "..";
import { OnProgressInfo } from "./ProgressInfo";
import { Converter, RowsReader } from "./Converter";
import { ConverterFactoryDescr } from "./ConverterFactory";
import { surfaceConverter } from "./surfaceConverter";
import { ConverterSearchProps, defaultConverterSearchProps } from "./search";
import { findPathEx } from "./search/findPath";
import { buildConverterGraph } from "./search/buildConverterGraph";
import { allConverters } from "./allConverters";

export const createConverterFromList = (
  list: ConverterFactoryDescr[],
  surface: Surface,
  progress?: OnProgressInfo
): Converter =>
  list.reduce(
    (nextConverter: Converter, descr) =>
      descr.create({
        nextConverter,
        size: surface.size,
        srcSign: descr.srcSign,
        dstSign: descr.dstSign,
        progress,
      }),
    surfaceConverter(surface)
  );

export type OptionsCreateConverter = {
  progress?: OnProgressInfo;
  converterSearchProps?: ConverterSearchProps;
};

// export const createConverterCommon = ()

export const createConverterForWrite = (
  srcImage: Surface,
  dstPixFmt: PixelFormat,
  options?: OptionsCreateConverter
): Converter => {
  if (srcImage.info.fmt.equals(dstPixFmt)) {
    return surfaceConverter(srcImage, options?.progress);
  }
  const graph = buildConverterGraph(
    options?.converterSearchProps ?? defaultConverterSearchProps,
    allConverters
  );
  const path: ConverterFactoryDescr[] = findPathEx(
    srcImage.info.fmt.signature,
    dstPixFmt.signature,
    graph
  );
  return createConverterFromList(path, srcImage, options?.progress);
};

export const createRowsReader = (
  srcImage: Surface,
  dstPixFmt: PixelFormat,
  options?: OptionsCreateConverter
): Promise<RowsReader> => {
  const converter = createConverterForWrite(srcImage, dstPixFmt, options);
  const { palette } = dstPixFmt;
  return converter.getRowsReader({ palette });
};

export const createConverterForRead = (
  srcPixFmt: PixelFormat,
  dstImage: Surface,
  options?: OptionsCreateConverter
): Converter => {
  if (srcPixFmt.equals(dstImage.info.fmt)) {
    return surfaceConverter(dstImage, options?.progress);
  }
  const graph = buildConverterGraph(
    options?.converterSearchProps ?? defaultConverterSearchProps,
    allConverters
  );
  const path: ConverterFactoryDescr[] = findPathEx(
    srcPixFmt.signature,
    dstImage.info.fmt.signature,
    graph
  );
  return createConverterFromList(path, dstImage, options?.progress);
};
