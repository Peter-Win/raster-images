import { Converter } from "../Converter";
import { ParamsConverter } from "./ParamsConverter";
import { Histogram } from "../quant2";
import { createFloydSteinberg8 } from "../dithering/FloydSteinberg";
import { ErrorRI } from "../../utils";
import { SurfaceStd } from "../../Surface";
import { createInfo, getImageLineSize } from "../../ImageInfo";
import { PixelFormat } from "../../PixelFormat";

export interface ParamsQuant2Converter extends ParamsConverter {
  dithering?: boolean;
}

export const quant2Converter = (params: ParamsQuant2Converter): Converter => {
  const { nextConverter, size, dstSign, dithering, progress } = params;
  //   const onProgress = async (y: number, init?: boolean) => {
  //     if (progress)
  //       await progress({
  //         step: "quant2",
  //         value: y,
  //         maxValue: size.y,
  //         init,
  //       });
  //   };
  const makeCvtRow = (
    hist: Histogram,
    width: number
  ): ((src: Uint8Array, dst: Uint8Array) => void) => {
    if (dithering) {
      const ctx = createFloydSteinberg8(width, 3);
      return (src, dst) =>
        hist.cvtDither(
          width,
          src.buffer,
          src.byteOffset,
          dst.buffer,
          dst.byteOffset,
          ctx
        );
    }
    return (src, dst) =>
      hist.cvt(width, src.buffer, src.byteOffset, dst.buffer, dst.byteOffset);
  };
  return {
    progress,
    getRowsWriter: async (srcInfo) => {
      if (srcInfo.fmt.signature !== "B8G8R8") {
        throw new ErrorRI("Expected B8G8R8 for Quant2 writer");
      }
      // await onProgress(0, true);
      // Двухпроходный алгоритм.
      // Первый проход совершается вызовами getBuffer/flushBuffer.
      // Он сохраняет поступившие строки во временное изображение
      // и добавляет цвета в гисторгамму.
      const hist = new Histogram();
      const srcImg = new SurfaceStd(srcInfo);
      const { width, height } = srcImg;
      const rowCvt = makeCvtRow(hist, width);
      return {
        getBuffer: async (y: number) => srcImg.getRowBuffer(y),
        flushBuffer: async (y: number) => {
          hist.addRowBGR(width, srcImg.getRowBuffer(y));
        },
        finish: async () => {
          // Второй проход. Формируется палитра
          const { desiredPalette } = nextConverter;
          if (desiredPalette) {
            hist.makePalette(desiredPalette);
          } else {
            hist.makePaletteN();
          }
          // Теперь можно конвертировать данные в I8
          const dstInfo = createInfo(
            width,
            height,
            8,
            "Indexed",
            false,
            hist.pal
          );
          const dstWriter = await nextConverter.getRowsWriter(dstInfo);
          for (let y = 0; y < height; y++) {
            // await onProgress(y);
            const dstRow = await dstWriter.getBuffer(y);
            const srcRow = srcImg.getRowBuffer(y);
            rowCvt(srcRow, dstRow);
            await dstWriter.flushBuffer(y);
          }
          // await onProgress(height);
          await dstWriter.finish();
        },
      };
    },
    getRowsReader: async (options) => {
      // await onProgress(0, true);
      // Здесь на на входе dstInfo вполне возможно будет без палитры. Но она появится позже.
      const srcImg = await nextConverter.getSurface();
      if (srcImg.info.fmt.signature !== "B8G8R8") {
        throw new ErrorRI(
          "Quant2 RowsReader expected the surface pixel format to be B8G8R8, but got <fmt>",
          { fmt: srcImg.info.fmt.signature }
        );
      }
      const { width } = srcImg;
      const dstInfo = { size, fmt: new PixelFormat(dstSign) }; // I8, но пока без палитры
      const dstRow = new Uint8Array(getImageLineSize(dstInfo));
      const hist = new Histogram();
      await hist.addImageBGR(srcImg /* , progress */);
      const palette = options?.palette;
      if (palette) {
        hist.makePalette(palette);
      } else {
        hist.makePaletteN();
      }
      dstInfo.fmt.setPalette(hist.pal); // теперь с палитрой
      const cvtRow = makeCvtRow(hist, width);
      return {
        dstInfo,
        readRow: async (y: number) => {
          cvtRow(srcImg.getRowBuffer(y), dstRow);
          return dstRow;
        },
        finish: async () => {},
      };
    },
    getSurface: async (options) => {
      // PS. Возможно объединить с getRowsReader
      const { palette } = options || {};
      const srcImg = await nextConverter.getSurface();
      const { width, height } = srcImg;
      const { signature } = srcImg.info.fmt;
      if (signature !== "B8G8R8") {
        throw new ErrorRI(
          "Quant2Converter.getSurface expected B8G8R8, but got <fmt>",
          { fmt: signature }
        );
      }
      const hist = new Histogram();
      hist.addImageBGR(srcImg);
      if (palette) {
        hist.makePalette(palette);
      } else {
        hist.makePaletteN(256);
      }
      const dstImg = SurfaceStd.create(width, height, 8, {
        colorModel: "Indexed",
        palette: hist.pal,
      });
      const cvtRow = makeCvtRow(hist, width);
      for (let y = 0; y < height; y++) {
        cvtRow(srcImg.getRowBuffer(y), dstImg.getRowBuffer(y));
      }
      return dstImg;
    },
  };
};
