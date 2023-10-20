import { Surface } from "../Surface";
import { Converter, RowsReader, RowsWriter } from "./Converter";
import { OnProgressInfo } from "./ProgressInfo";

export const surfaceConverter = (
  surface: Surface,
  progress?: OnProgressInfo
): Converter => ({
  progress,
  desiredPalette: surface.palette,
  async getRowsWriter(srcInfo): Promise<RowsWriter> {
    const { palette } = srcInfo.fmt;
    if (palette /*  && !surface.palette */) {
      surface.setPalette(palette);
    }
    return {
      getBuffer: async (y: number) => surface.getRowBuffer(y),
      flushBuffer: async () => {},
      finish: async () => {},
    };
  },
  async getRowsReader(): Promise<RowsReader> {
    return {
      dstInfo: surface.info,
      readRow: async (y) => surface.getRowBuffer(y),
      finish: async () => {},
    };
  },
  async getSurface(): Promise<Surface> {
    return surface;
  },
});
