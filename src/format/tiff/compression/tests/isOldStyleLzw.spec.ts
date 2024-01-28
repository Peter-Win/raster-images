import { RAStream } from "../../../../stream";
import { onStreamFromGallery } from "../../../../tests/streamFromGallery";
import { FormatTiff } from "../../FormatTiff";
import { TiffTag } from "../../TiffTag";
import { Ifd } from "../../ifd/Ifd";
import { TiffCompression } from "../../tags/TiffCompression";
import { isOldStyleLzw } from "../isOldStyleLzw";

const onIfd = async (
  name: string,
  callBack: (ifd: Ifd, stream: RAStream) => Promise<void>
) =>
  onStreamFromGallery(name, async (stream) => {
    const format = await FormatTiff.create(stream);
    const frame = format.frames[0]!;
    const { ifd } = frame;
    await callBack(ifd, stream);
  });

describe("isOldStyleLzw", () => {
  it("Not LZW", async () => {
    await onIfd("tiff/RGB8.tiff", async (ifd, stream) => {
      const comp = await ifd.getSingleNumber(TiffTag.Compression, stream);
      expect(comp).toBe(TiffCompression.None);
      expect(await isOldStyleLzw(ifd, stream)).toBe(false);
    });
  });
  it("Standard LZW strip", async () => {
    await onIfd("tiff/shapes_lzw.tif", async (ifd, stream) => {
      const comp = await ifd.getSingleNumber(TiffTag.Compression, stream);
      expect(comp).toBe(TiffCompression.LZW);
      expect(await isOldStyleLzw(ifd, stream)).toBe(false);
    });
  });
  it("Standard LZW tiled", async () => {
    await onIfd("tiff/shapes_lzw_tiled.tif", async (ifd, stream) => {
      const comp = await ifd.getSingleNumber(TiffTag.Compression, stream);
      expect(comp).toBe(TiffCompression.LZW);
      const tw = await ifd.getSingleNumberOpt(TiffTag.TileWidth, stream);
      expect(tw).toBe(32);
      expect(await isOldStyleLzw(ifd, stream)).toBe(false);
    });
  });

  it("Old LZW strip", async () => {
    await onIfd("tiff/rgb-lzwold.tiff", async (ifd, stream) => {
      const comp = await ifd.getSingleNumber(TiffTag.Compression, stream);
      expect(comp).toBe(TiffCompression.LZW);
      expect(await isOldStyleLzw(ifd, stream)).toBe(true);
    });
  });
});
