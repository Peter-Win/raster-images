import {
  indexed8toRgb24,
  makePaletteCacheRgba,
} from "../../../Converter/rowOps/indexed/indexed8toRgb";
import { loadImageFromFrame } from "../../../loadImage";
import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { dump, dumpA } from "../../../utils";
import { getTestFile } from "../../../tests/getTestFile";
import { FormatTiff } from "../FormatTiff";
import { TiffTag } from "../TiffTag";
import { saveBmpImage } from "../../bmp/save";
import { PixelFormat } from "../../../PixelFormat";
import { helloImg } from "../compression/ccitt/tests/helloImg";

describe("FormatTiff", () => {
  it("TIFF RGB64", async () => {
    await onStreamFromGallery("tiff/rgb64-multi.tif", async (stream) => {
      const fmt = await FormatTiff.create(stream);
      expect(fmt.frames.length).toBe(2);
      const frm0 = fmt.frames[0]!;
      expect(frm0.info.fmt.signature).toBe("R64G64B64");
      expect(
        await frm0.ifd.getSingleNumber(TiffTag.PlanarConfiguration, stream)
      ).toBe(2);

      const img0 = await loadImageFromFrame(frm0);
      const brow0 = img0.getRowBuffer(0);
      const frow0 = new Float64Array(brow0.buffer, brow0.byteOffset);
      expect(
        Array.from(frow0)
          .slice(0, 6)
          .map((n) => n.toFixed(4))
          .join(" ")
      ).toBe("0.1223 0.1532 0.7516 0.1991 0.7686 0.5855");
    });
  });

  it("TIFF RGB8 LZW", async () => {
    await onStreamFromGallery("tiff/rgb-lzw.tif", async (stream) => {
      const fmt = await FormatTiff.create(stream);
      expect(fmt.frames.length).toBe(1);
      const fr = fmt.frames[0]!;
      expect(fr.info.fmt.signature).toBe("R8G8B8");

      const img = await loadImageFromFrame(fr);
      const row0 = img.getRowBuffer(0);
      expect(dump(row0.slice(0, 12))).toBe(
        "A2 B5 F1 A2 B5 F1 A2 B5 F1 A5 B4 F3"
      );
    });
  });

  it("TIFF palette", async () => {
    await onStreamFromGallery("tiff/GAMMA.TIF", async (stream) => {
      const fmt = await FormatTiff.create(stream);
      expect(fmt.frames.length).toBe(1);
      const fr = fmt.frames[0]!;
      expect(fr.info.fmt.signature).toBe("I8");
      const palette = fr.info.fmt.palette!;
      expect(palette?.length).toBe(256);
      expect(palette[0]).toEqual([0, 0, 0, 0xff]);
      expect(palette[1]).toEqual([0x80, 0, 0, 0xff]);
      expect(dumpA(palette[2]!)).toEqual("FF 00 00 FF");
      expect(dumpA(palette[7]!)).toEqual("00 00 FF FF");

      const palCache = makePaletteCacheRgba(palette!);

      const img = await loadImageFromFrame(fr);

      const getRgbRow = (y: number): Uint8Array => {
        const rowRgb = new Uint8Array(img.width * 3);
        indexed8toRgb24(img.width, img.getRowBuffer(y), rowRgb, palCache);
        return rowRgb;
      };

      const row0x = getRgbRow(0);
      // black, red, black, red
      expect(dump(row0x.slice(0, 12))).toBe(
        "00 00 00 FF 00 00 00 00 00 FF 00 00"
      );

      const row86x = getRgbRow(86);
      // black, green, black, green
      expect(dump(row86x.slice(0, 12))).toBe(
        "00 00 00 00 FF 00 00 00 00 00 FF 00"
      );

      const rowLx = getRgbRow(343);
      // white, black, white
      expect(dump(rowLx.slice(-9))).toBe("FF FF FF 00 00 00 FF FF FF");

      const wstream = await getTestFile(__dirname, "gamma.bmp", "w");
      await saveBmpImage(img, wstream);
    });
  });

  it("TIFF PackBits", async () => {
    await onStreamFromGallery("tiff/G8-PackBits.tif", async (stream) => {
      const fmt = await FormatTiff.create(stream);
      expect(fmt.frames.length).toBe(1);
      const fr = fmt.frames[0]!;
      expect(fr.info.fmt.signature).toBe("G8");
      const img = await loadImageFromFrame(fr);
      const getPixel = (x: number, y: number) => img.getRowBuffer(y)[x]!;
      expect(getPixel(0, 0)).toBe(0);
      expect(getPixel(1, 1)).toBe(255);
      expect(getPixel(197, 80)).toBe(255);
      expect(getPixel(198, 81)).toBe(0);
    });
  });

  it("TIFF BW ZIP", async () => {
    await onStreamFromGallery("tiff/g1-zip.tif", async (stream) => {
      const fmt = await FormatTiff.create(stream);
      expect(fmt.frames.length).toBe(1);
      const fr = fmt.frames[0]!;
      expect(fr.info.fmt.signature).toBe("G1");
      expect(fr.info.vars?.compression).toBe("ZIP");
      const img = await loadImageFromFrame(fr);
      const getPixel = (x: number, y: number) =>
        (img.getRowBuffer(y)[x >> 3]! >> (7 - (x & 7))) & 1;
      expect(getPixel(0, 0)).toBe(0);
      expect(getPixel(105, 55)).toBe(1);
      expect(getPixel(106, 55)).toBe(0);
      expect(getPixel(195, 149)).toBe(1);
    });
  });

  it("TIFF BW Group3", async () => {
    await onStreamFromGallery("tiff/group3.tif", async (stream) => {
      const fmt = await FormatTiff.create(stream);
      expect(fmt.frames.length).toBe(1);
      const fr = fmt.frames[0]!;
      expect(fr.info.fmt.signature).toBe("G1");
      expect(fr.info.vars?.compression).toBe("Group3Fax");
      const offsets = await fr.ifd.getNumbers(TiffTag.StripOffsets, stream);
      await stream.seek(offsets[0]!);
      const img = await loadImageFromFrame(fr, {
        target: new PixelFormat("G8"),
      });
      for (let y = 0; y < img.height; y++) {
        let txtRow = String(y);
        const srcRow = img.getRowBuffer(y);
        for (let x = 0; x < img.width; x++) {
          txtRow += srcRow[x] ? " " : "X";
        }
        expect(txtRow).toBe(helloImg[y]);
      }
    });
  });

  it("TIFF BW Group4", async () => {
    await onStreamFromGallery("tiff/group4.tif", async (stream) => {
      const fmt = await FormatTiff.create(stream);
      expect(fmt.frames.length).toBe(1);
      const fr = fmt.frames[0]!;
      expect(fr.info.fmt.signature).toBe("G1");
      expect(fr.info.vars?.compression).toBe("Group4Fax");
      const offsets = await fr.ifd.getNumbers(TiffTag.StripOffsets, stream);
      await stream.seek(offsets[0]!);
      const img = await loadImageFromFrame(fr, {
        target: new PixelFormat("G8"),
      });
      for (let y = 0; y < img.height; y++) {
        let txtRow = String(y);
        const srcRow = img.getRowBuffer(y);
        for (let x = 0; x < img.width; x++) {
          txtRow += srcRow[x] ? " " : "X";
        }
        expect(txtRow).toBe(helloImg[y]);
      }
    });
  });
});
