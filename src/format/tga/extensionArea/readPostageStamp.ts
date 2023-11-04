import { Point } from "../../../math";
import { PixelFormat } from "../../../PixelFormat";
import { SurfaceStd, Surface } from "../../../Surface";
import { RAStream, readByte } from "../../../stream";

export const readPostageStamp = async (
  stream: RAStream,
  offset: number,
  pixFmt: PixelFormat
): Promise<Surface> => {
  await stream.seek(offset);
  const width = await readByte(stream);
  const height = await readByte(stream);
  const img = new SurfaceStd({
    size: new Point(width, height),
    fmt: pixFmt,
  });
  await stream.readBuffer(img.data, img.data.byteLength);
  return img;
};
