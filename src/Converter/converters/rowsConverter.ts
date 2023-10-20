import { PixelFormat } from "../../PixelFormat";
import { ImageInfo, getImageLineSize } from "../../ImageInfo";
import { Surface, SurfaceStd } from "../../Surface";
import { Converter } from "../Converter";
import { ParamsConverter, makeDstInfoStd } from "./ParamsConverter";

type MakeRowCvt = (
  width: number,
  srcPixFmt: PixelFormat,
  dstPixFmt: PixelFormat
) => (src: Uint8Array, dst: Uint8Array) => void;

interface ParamsRowsConverter extends ParamsConverter {
  makeRowCvt: MakeRowCvt;
}

export const rowsConverter = (params: ParamsRowsConverter): Converter => {
  const { nextConverter, size, makeRowCvt, progress } = params;
  return {
    progress,
    getRowsWriter: async (srcInfo) => {
      // алгоритм, читающий растровые данные из файла, получает буфер в том формате, который для него подходит
      const srcRowBuffer = new Uint8Array(getImageLineSize(srcInfo));
      const dstInfo = makeDstInfoStd(srcInfo, params);
      const nextWriter = await nextConverter.getRowsWriter(dstInfo);
      const rowCvt = makeRowCvt(size.x, srcInfo.fmt, dstInfo.fmt);
      return {
        getBuffer: async (/* y: number */) => srcRowBuffer,
        flushBuffer: async (y: number) => {
          const dstRow = await nextWriter.getBuffer(y);
          rowCvt(srcRowBuffer, dstRow);
          await nextWriter.flushBuffer(y);
        },
        finish: async () => {
          await nextWriter.finish();
        },
      };
    },
    getRowsReader: async () => {
      // алгоритм, который пишет в файл, должен получить данные в нужном формате
      const nextReader = await nextConverter.getRowsReader();
      const srcInfo: ImageInfo = nextReader.dstInfo;
      const dstInfo: ImageInfo = makeDstInfoStd(srcInfo, params);
      const buf = new Uint8Array(getImageLineSize(dstInfo));
      const width = dstInfo.size.x;
      const rowCvt = makeRowCvt(width, srcInfo.fmt, dstInfo.fmt);
      return {
        dstInfo,
        readRow: async (y: number) => {
          const srcRow = await nextReader.readRow(y);
          rowCvt(srcRow, buf);
          return buf;
        },
        finish: async () => {
          await nextReader.finish();
        },
      };
    },
    getSurface: async (): Promise<Surface> => {
      const reader = await nextConverter.getRowsReader();
      const srcInfo = reader.dstInfo;
      const dstInfo = makeDstInfoStd(srcInfo, params);
      const dstImg = new SurfaceStd(dstInfo);
      const { width, height } = dstImg;
      const rowCvt = makeRowCvt(width, srcInfo.fmt, dstImg.info.fmt);
      for (let y = 0; y < height; y++) {
        const srcRow = await reader.readRow(y);
        rowCvt(srcRow, dstImg.getRowBuffer(y));
      }
      await reader.finish();
      return dstImg;
    },
  };
};
