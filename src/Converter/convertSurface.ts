import { Surface, SurfaceStd } from "../Surface";
import { PixelFormat } from "../PixelFormat";
import { ErrorRI } from "../utils";
import { writeImage } from "./writeImage";
import { createRowsReader } from "./createConverter";
import { copyBytes } from "./rowOps/copy/copyBytes";

/**
 * Convert pixels from srcSurface to dstSurface
 * @param srcSurface
 * @param dstSurface size of dstSurface must be same as srcSurface
 */
export const convertPixels = async (
  srcSurface: Surface,
  dstSurface: Surface
) => {
  if (!srcSurface.size.equals(dstSurface.size)) {
    throw new ErrorRI("Image sizes do not match. src=<src>, dst=<dst>", {
      src: String(srcSurface.size),
      dst: String(dstSurface.size),
    });
  }
  const reader = await createRowsReader(srcSurface, dstSurface.info.fmt);
  if (dstSurface.info.fmt.colorModel === "Indexed") {
    dstSurface.setPalette(reader.dstInfo.fmt.palette);
  }
  const onRow = async (row: Uint8Array, y: number) => {
    copyBytes(row.length, row, 0, dstSurface.getRowBuffer(y), 0);
  };
  await writeImage(reader, onRow);
};

export const convertSurface = async (
  surface: Surface,
  dstPixFmt: PixelFormat | string
): Promise<Surface> => {
  const dstInfo = {
    size: surface.size.clone(),
    fmt: typeof dstPixFmt === "string" ? new PixelFormat(dstPixFmt) : dstPixFmt,
  };
  const dstSurface = new SurfaceStd(dstInfo);
  await convertPixels(surface, dstSurface);
  return dstSurface;
};
