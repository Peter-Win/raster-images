import {
  indexed8toRgb24,
  makePaletteCacheRgba,
} from "../../../Converter/rowOps/indexed/indexed8toRgb";
import { loadImageByName, loadImageFromFrame } from "../../../loadImage";
import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { dump, dumpA, dumpFloat32, dumpW } from "../../../utils";
import { getTestFile } from "../../../tests/getTestFile";
import { FormatTiff } from "../FormatTiff";
import { TiffTag } from "../TiffTag";
import { saveBmpImage } from "../../bmp/save";
import { PixelFormat } from "../../../PixelFormat";
import { helloImg } from "../compression/ccitt/tests/helloImg";
import { TiffCompression } from "../tags/TiffCompression";
import { SurfaceStd } from "../../../Surface";
import { savePngImage } from "../../png/save";
import { surfaceConverter } from "../../../Converter/surfaceConverter";
import { readImage } from "../../../Converter";
import { createStripsReader } from "../createStripsReader";

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

  it("TIFF Non-std bits per sample", async () => {
    const img8 = await onStreamFromGallery(
      "tiff/shapes_lzw.tif",
      async (stream) => loadImageByName(stream)
    );
    expect(img8.info.fmt.signature).toBe("R8G8B8");

    await onStreamFromGallery("tiff/shapes_lzw_14bps.tif", async (stream) => {
      const fmt = await FormatTiff.create(stream);
      expect(fmt.frames.length).toBe(1);
      const frm = fmt.frames[0]!;
      const { ifd, info } = frm;
      expect(info.fmt.signature).toBe("R16G16B16");
      const { x: width, y: height } = info.size;
      expect(width).toBe(img8.width);
      expect(height).toBe(img8.height);
      const compressionId = await ifd.getSingleNumber<TiffCompression>(
        TiffTag.Compression,
        stream
      );
      expect(compressionId).toBe(TiffCompression.LZW);

      const testImg = await loadImageFromFrame(frm);
      for (let y = 0; y < height; y++) {
        const row16 = testImg.getRowBuffer16(y);
        const row8 = img8.getRowBuffer(y);
        let p16 = 0;
        let p8 = 0;
        for (let x = 0; x < width; x++) {
          for (let i = 0; i < 3; i++) {
            const c16 = row16[p16++]!;
            const c8 = row8[p8++]!;
            if (Math.abs((c16 >> 8) - c8) > 1) {
              expect(`y=${y}, x=${x}, ${dumpW(row16, x * 3, x * 3 + 3)}`).toBe(
                `y=${y}, x=${x}, ${dump(row8, 3 * x, x * 3 + 3)}`
              );
            }
          }
        }
      }
    });
  });

  it("TIFF Planar", async () => {
    const img8 = await onStreamFromGallery(
      "tiff/shapes_lzw.tif",
      async (stream) => loadImageByName(stream)
    );
    expect(img8.info.fmt.signature).toBe("R8G8B8");

    await onStreamFromGallery("tiff/shapes_lzw_planar.tif", async (stream) => {
      const fmt = await FormatTiff.create(stream);
      expect(fmt.frames.length).toBe(1);
      const frm = fmt.frames[0]!;
      const { info, ifd } = frm;
      expect(info.fmt.signature).toBe("R8G8B8");
      const planarConfig = await ifd.getSingleNumber(
        TiffTag.PlanarConfiguration,
        stream
      );
      expect(planarConfig).toBe(2);

      const sizes = await ifd.getNumbers(TiffTag.StripByteCounts, stream);
      const offsets = await ifd.getNumbers(TiffTag.StripOffsets, stream);
      expect(sizes.length).toBe(3);
      expect(offsets.length).toBe(3);
      const { x: width, y: height } = info.size;
      for (let iSample = 0; iSample < 3; iSample++) {
        const channelImg = SurfaceStd.create(width, height, 8, {
          colorModel: "Gray",
        });
        const converter = surfaceConverter(channelImg);
        const onRow = await createStripsReader({
          offsets,
          sizes,
          ifd,
          stream,
          rowSize: width,
          bitsPerSample: 8,
          samplesCount: 1,
        });
        await readImage(converter, channelImg.info, onRow);

        const dstName = `planar-channel-${["r", "g", "b"][iSample]}.png`;
        const ws = await getTestFile(__dirname, dstName, "w");
        await savePngImage(channelImg, ws);
      }

      const testImg = await loadImageFromFrame(frm);
      for (let y = 0; y < testImg.height; y++) {
        const rowTest = testImg.getRowBuffer(y);
        const rowOrigin = img8.getRowBuffer(y);
        let pTest = 0;
        let pOrigin = 0;
        for (let x = 0; x < testImg.width; x++) {
          for (let i = 0; i < 3; i++) {
            const cTest = rowTest[pTest++]!;
            const cOrigin = rowOrigin[pOrigin++]!;
            if (Math.abs(cTest - cOrigin) > 1) {
              expect(`y=${y}, x=${x}, ${dump(rowTest, x * 3, x * 3 + 3)}`).toBe(
                `y=${y}, x=${x}, ${dump(rowOrigin, 3 * x, x * 3 + 3)}`
              );
            }
          }
        }
      }
    });
  });

  it("TIFF Planar Non-std", async () => {
    const img8 = await onStreamFromGallery(
      "tiff/shapes_lzw.tif",
      async (stream) => loadImageByName(stream)
    );
    expect(img8.info.fmt.signature).toBe("R8G8B8");

    await onStreamFromGallery(
      "tiff/shapes_lzw_planar_10bps.tif",
      async (stream) => {
        const fmt = await FormatTiff.create(stream);
        expect(fmt.frames.length).toBe(1);
        const frm = fmt.frames[0]!;
        const { ifd, info } = frm;
        expect(info.fmt.signature).toBe("R16G16B16");
        expect(info.vars?.bitsPerSample).toEqual([10, 10, 10]);
        const { x: width, y: height } = info.size;
        expect(width).toBe(img8.width);
        expect(height).toBe(img8.height);
        const compressionId = await ifd.getSingleNumber<TiffCompression>(
          TiffTag.Compression,
          stream
        );
        expect(compressionId).toBe(TiffCompression.LZW);

        const testImg = await loadImageFromFrame(frm);
        for (let y = 0; y < height; y++) {
          const row16 = testImg.getRowBuffer16(y);
          const row8 = img8.getRowBuffer(y);
          let p16 = 0;
          let p8 = 0;
          for (let x = 0; x < width; x++) {
            for (let i = 0; i < 3; i++) {
              const c16 = row16[p16++]!;
              const c8 = row8[p8++]!;
              if (Math.abs((c16 >> 8) - c8) > 1) {
                expect(
                  `y=${y}, x=${x}, ${dumpW(row16, x * 3, x * 3 + 3)}`
                ).toBe(`y=${y}, x=${x}, ${dump(row8, 3 * x, x * 3 + 3)}`);
              }
            }
          }
        }
      }
    );
  });

  it("TIFF Predictor 3", async () => {
    const img8 = await onStreamFromGallery(
      "tiff/shapes_lzw.tif",
      async (stream) => loadImageByName(stream)
    );
    expect(img8.info.fmt.signature).toBe("R8G8B8");

    await onStreamFromGallery(
      "tiff/shapes_lzw_predictor3.tif",
      async (stream) => {
        const fmt = await FormatTiff.create(stream);
        expect(fmt.frames.length).toBe(1);
        const frm = fmt.frames[0]!;
        const { ifd, info } = frm;
        expect(info.fmt.signature).toBe("R32G32B32");
        const { x: width, y: height } = info.size;
        expect(width).toBe(img8.width);
        expect(height).toBe(img8.height);
        const compressionId = await ifd.getSingleNumber<TiffCompression>(
          TiffTag.Compression,
          stream
        );
        expect(compressionId).toBe(TiffCompression.LZW);
        const predictor = await ifd.getSingleNumber(TiffTag.Predictor, stream);
        expect(predictor).toBe(3);

        const testImg = await loadImageFromFrame(frm);
        for (let y = 0; y < height; y++) {
          const row32 = testImg.getRowBuffer32(y);
          const row8 = img8.getRowBuffer(y);
          let p32 = 0;
          let p8 = 0;
          for (let x = 0; x < width; x++) {
            for (let i = 0; i < 3; i++) {
              const c32 = row32[p32++]!;
              const c8 = row8[p8++]!;
              if (Math.abs(c32 * 256 - c8) > 1) {
                expect(
                  `y=${y}, x=${x}, ${dumpFloat32(row32, 0, x * 3, x * 3 + 3)}`
                ).toBe(`y=${y}, x=${x}, ${dump(row8, 3 * x, x * 3 + 3)}`);
              }
            }
          }
        }
      }
    );
  });

  it("TIFF float16", async () => {
    await onStreamFromGallery("tiff/rgb-float16.tif", async (stream) => {
      const img = await loadImageByName(stream);
      expect(img.info.fmt.signature).toBe("R32G32B32");
      const row = img.getRowBuffer32(0);
      expect(row[0]).toBeCloseTo(0.597, 3);
      expect(row[1]).toBeCloseTo(0.66, 3);
      expect(row[2]).toBeCloseTo(0.758, 3);
    });
  });
});
