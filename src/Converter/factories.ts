import { ErrorRI } from "../utils";
import { ConverterFactoryDescr, ConverterProps } from "./ConverterFactory";
import { rowsConverter } from "./converters/rowsConverter";
import { FnRowOp } from "./rowOps/FnRowOp";
import {
  FnMakePaletteCache,
  FnOpWithPalette,
} from "./rowOps/indexed/indexed8toRgb";
import { DitherCtx } from "./dithering/DitherCtx";
import { createFloydSteinberg } from "./dithering/FloydSteinberg";
import { quant2Converter } from "./converters/quant2Converter";
import { Palette } from "../Palette";
import { PixelFormat } from "..";
import { paletteReduceConverter } from "./converters/paletteReduceConverter";

export const makeDefaultProps = (
  props?: Partial<ConverterProps>
): ConverterProps => ({
  loss: props?.loss ?? false,
  speed: props?.speed ?? 100,
  quality: props?.quality ?? 100,
  dithering: props?.dithering,
});

export const factoryRowOp = (
  srcSign: string,
  dstSign: string,
  rowOp: FnRowOp,
  props?: Partial<ConverterProps>,
  label?: string
): ConverterFactoryDescr => ({
  label,
  srcSign,
  dstSign,
  props: makeDefaultProps(props),
  create: (params) =>
    rowsConverter({
      ...params,
      makeRowCvt: (width) => (src, dst) => rowOp(width, src, dst),
    }),
});

const checkPalette = (
  palette: Readonly<Palette> | undefined,
  srcSign: string,
  dstSign: string
): Readonly<Palette> => {
  if (!palette)
    throw new ErrorRI("Expected palette for <src> to <dst> converter", {
      src: srcSign,
      dst: dstSign,
    });
  return palette;
};

export const factoryPalette = (
  srcSign: string,
  dstSign: string,
  rowOp: FnOpWithPalette,
  makePaletteCache: FnMakePaletteCache,
  props?: Partial<ConverterProps>,
  label?: string
): ConverterFactoryDescr => ({
  label,
  srcSign,
  dstSign,
  props: makeDefaultProps(props),
  create: (params) =>
    rowsConverter({
      ...params,
      makeRowCvt: (width, { palette }) => {
        const paletteCache = makePaletteCache(
          checkPalette(palette, srcSign, dstSign)
        );
        return (src, dst) => rowOp(width, src, dst, paletteCache);
      },
    }),
});

export type FnRowOpDithering = (
  width: number,
  src: Uint8Array,
  dst: Uint8Array,
  ctx: DitherCtx
) => void;

export const factoryDithering = (
  srcSign: string,
  dstSign: string,
  rowOp: FnRowOpDithering,
  props?: Partial<ConverterProps>,
  label?: string
): ConverterFactoryDescr => ({
  label,
  srcSign,
  dstSign,
  props: { ...makeDefaultProps(props), dithering: true, loss: true },
  create: (params) =>
    rowsConverter({
      ...params,
      makeRowCvt: (width, srcPixFmt) => {
        const ctx = createFloydSteinberg(width, srcPixFmt);
        return (src, dst) => rowOp(width, src, dst, ctx);
      },
    }),
});

export const factoryQuant2 = (
  props: Partial<ConverterProps>,
  label: string
): ConverterFactoryDescr => ({
  label,
  srcSign: "B8G8R8",
  dstSign: "I8",
  props: { ...makeDefaultProps(props), loss: true },
  create: (params) =>
    quant2Converter({ ...params, dithering: props.dithering }),
});

export const factoryIndexedDown = (
  srcSign: string,
  dstSign: string,
  rowOp: FnRowOp,
  props?: Partial<ConverterProps>,
  label?: string
): ConverterFactoryDescr => {
  const defProps = { ...makeDefaultProps(props), loss: true };
  return {
    label,
    srcSign,
    dstSign,
    props: defProps,
    create: (params) =>
      paletteReduceConverter({
        ...params,
        rowOp,
        dithering: !!defProps.dithering,
      }),
  };
};

// from low to high palette
export const factoryIndexedUp = (
  srcSign: string,
  dstSign: string,
  rowOp: FnRowOp,
  props?: Partial<ConverterProps>,
  label?: string
): ConverterFactoryDescr => ({
  label,
  srcSign,
  dstSign,
  props: makeDefaultProps(props),
  create: (params) =>
    rowsConverter({
      ...params,
      makeDstInfo: (srcInfo) => {
        const fmt = new PixelFormat(dstSign);
        fmt.setPalette(
          checkPalette(srcInfo.fmt.palette, srcInfo.fmt.signature, dstSign)
        );
        return {
          size: srcInfo.size,
          fmt,
        };
      },
      makeRowCvt: (width) => (src, dst) => rowOp(width, src, dst),
    }),
});
