import { ErrorRI } from "../../utils";
import { createFreePalette } from "../../Palette";
import { Converter } from "../Converter";
import { PixelFormat } from "../../PixelFormat";
import { getImageLineSize } from "../../ImageInfo";
import { ParamsConverter } from "./ParamsConverter";
import { FnRowOp } from "../rowOps/FnRowOp";

export type ParamsPaletteReduceConverter = ParamsConverter & {
  dithering: boolean;
  rowOp: FnRowOp;
};

/**
 * Конвертер для понижения глубины индексных форматов.
 * Например, I8 -> I4
 * Преобразование включает:
 * - упаковку более длинных битовых значений в короткие (это в любом случае)
 * - снижение количества цветов в палитре (только если необходимо)
 * @param params
 * @returns
 */
export const paletteReduceConverter = (
  params: ParamsPaletteReduceConverter
): Converter => {
  const { nextConverter, size, /* dithering */ progress, rowOp } = params;
  const width = size.x;
  return {
    progress,
    getRowsReader: async () => {
      // Сообщение для следующего конвертера, который возможно будет формировать палитру.
      // Он может учесть пожелание о том, что нужно 16 цветов.
      const desiredPalette = createFreePalette(16);
      // С высокой вероятностью исхлдный конвертер будет иметь уже готовое изображение.
      const srcSurface = await nextConverter.getSurface({
        palette: desiredPalette,
      });
      const srcPalette = srcSurface.palette;
      if (!srcPalette) {
        throw new ErrorRI("paletteReduceConverter expected a palette");
      }
      // TODO: Пока только вариант для случая когда палитра в пределах 16 цветов
      if (srcPalette.length > 16)
        throw new ErrorRI("Expected 16-colors palette, but got <n>", {
          n: srcPalette.length,
        });
      const dstInfo = {
        size: params.size,
        fmt: new PixelFormat(params.dstSign),
      };
      dstInfo.fmt.setPalette(srcPalette);
      const dstBuffer = new Uint8Array(getImageLineSize(dstInfo));
      return {
        dstInfo,
        readRow: async (y: number): Promise<Uint8Array> => {
          rowOp(width, srcSurface.getRowBuffer(y), dstBuffer);
          return dstBuffer;
        },
        finish: async () => {},
      };
    },
    getSurface: async () => {
      throw new ErrorRI("paletteReduceConverter.getSurface not implemented");
    },
    // заглушка
    getRowsWriter: async () => ({
      getBuffer: async (/* y: number */): Promise<Uint8Array> =>
        new Uint8Array(),
      flushBuffer: async (/* y: number */): Promise<void> => {},
      finish: async () => {},
    }),
  };
};
