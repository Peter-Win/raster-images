import { PixelFormat } from "../../PixelFormat";
import { SurfaceStd } from "../../Surface";
import { Point } from "../../math/Point";
import { dumpChunks } from "../../utils";
import { ImageReader } from "../ImageReader";
import { createImageReader } from "../createImageReader";
import { readImagePattern } from "../readImage";

const read3x2x24 = async (reader: ImageReader) => {
  // red  yellow green
  // cyan blue   magenta
  const srcRows = [
    [0, 0, 255, 0, 255, 255, 0, 255, 0],
    [255, 255, 0, 255, 0, 0, 255, 0, 255],
  ];
  for (let y = 0; y < srcRows.length; y++) {
    const dstBuf = await reader.getRowBuffer(y);
    const row = srcRows[y]!;
    for (let x = 0; x < row.length; x++) dstBuf[x] = row[x]!;
    await reader.finishRow(y);
  }
};

describe("createImageReader", () => {
  it("createImageReader direct", async () => {
    const srcFmt = new PixelFormat(24);
    const dstImage = SurfaceStd.create(3, 2, 24);
    const reader = createImageReader(srcFmt, dstImage);
    await readImagePattern(reader, srcFmt, dstImage, read3x2x24);
    expect(dumpChunks(3, dstImage.data)).toEqual([
      "00 00 FF", // red
      "00 FF FF", // yellow
      "00 FF 00", // green
      "FF FF 00", // cyan
      "FF 00 00", // blue
      "FF 00 FF", // magenta
    ]);
  });
  it("createImageReader row cvt", async () => {
    const srcFmt = new PixelFormat(24);
    const dstImage = SurfaceStd.create(3, 2, 32);
    const reader = createImageReader(srcFmt, dstImage);
    await readImagePattern(reader, srcFmt, dstImage, read3x2x24);
    expect(dumpChunks(4, dstImage.data)).toEqual([
      "00 00 FF FF", // red
      "00 FF FF FF", // yellow
      "00 FF 00 FF", // green
      "FF FF 00 FF", // cyan
      "FF 00 00 FF", // blue
      "FF 00 FF FF", // magenta
    ]);
  });
  it("createImageReader Error", async () => {
    const srcFmt = new PixelFormat(24);
    const dstImage = new SurfaceStd({
      size: new Point(3, 2),
      fmt: new PixelFormat("R8G8"), // invalid format with red and green only
    });
    expect(() => createImageReader(srcFmt, dstImage)).toThrowError(
      "Can't find pixel converter from B8G8R8 to R8G8"
    );
  });
});
