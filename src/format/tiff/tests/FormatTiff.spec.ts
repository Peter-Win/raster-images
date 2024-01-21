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
import { createStripsReader } from "../load/createStripsReader";
import { compareImages } from "../../../tests/compareImages";

const shapesName = "tiff/shapes_lzw.tif";

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
    await onStreamFromGallery("tiff/shapes_lzw_14bps.tif", async (stream) => {
      const fmt = await FormatTiff.create(stream);
      expect(fmt.frames.length).toBe(1);
      const frm = fmt.frames[0]!;
      const { ifd, info } = frm;
      expect(info.fmt.signature).toBe("R16G16B16");
      const compressionId = await ifd.getSingleNumber<TiffCompression>(
        TiffTag.Compression,
        stream
      );
      expect(compressionId).toBe(TiffCompression.LZW);

      const testImg = await loadImageFromFrame(frm);
      await compareImages(testImg, shapesName, (received, expected) => {
        expect(received).toBe(expected);
      });
    });
  });

  it("TIFF Planar", async () => {
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
          floatBitsPerSample: undefined,
        });
        await readImage(converter, channelImg.info, onRow);

        const dstName = `planar-channel-${["r", "g", "b"][iSample]}.png`;
        const ws = await getTestFile(__dirname, dstName, "w");
        await savePngImage(channelImg, ws);
      }

      const testImg = await loadImageFromFrame(frm);
      await compareImages(testImg, shapesName, (received, expected) => {
        expect(received).toBe(expected);
      });
    });
  });

  it("TIFF Planar Non-std", async () => {
    await onStreamFromGallery(
      "tiff/shapes_lzw_planar_10bps.tif",
      async (stream) => {
        const fmt = await FormatTiff.create(stream);
        expect(fmt.frames.length).toBe(1);
        const frm = fmt.frames[0]!;
        const { ifd, info } = frm;
        expect(info.fmt.signature).toBe("R16G16B16");
        expect(info.vars?.bitsPerSample).toEqual([10, 10, 10]);
        const compressionId = await ifd.getSingleNumber<TiffCompression>(
          TiffTag.Compression,
          stream
        );
        expect(compressionId).toBe(TiffCompression.LZW);

        const testImg = await loadImageFromFrame(frm);
        await compareImages(testImg, shapesName, (received, expected) => {
          expect(received).toBe(expected);
        });
      }
    );
  });

  it("TIFF Predictor 3", async () => {
    await onStreamFromGallery(
      "tiff/shapes_lzw_predictor3.tif",
      async (stream) => {
        const fmt = await FormatTiff.create(stream);
        expect(fmt.frames.length).toBe(1);
        const frm = fmt.frames[0]!;
        const { ifd, info } = frm;
        expect(info.fmt.signature).toBe("R32G32B32");
        const compressionId = await ifd.getSingleNumber<TiffCompression>(
          TiffTag.Compression,
          stream
        );
        expect(compressionId).toBe(TiffCompression.LZW);
        const predictor = await ifd.getSingleNumber(TiffTag.Predictor, stream);
        expect(predictor).toBe(3);

        const testImg = await loadImageFromFrame(frm);
        await compareImages(testImg, shapesName, (received, expected) => {
          expect(received).toBe(expected);
        });
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

  it("TIFF tiled", async () => {
    await onStreamFromGallery("tiff/shapes_lzw_tiled.tif", async (stream) => {
      const fmt = await FormatTiff.create(stream);
      expect(fmt.frames.length).toBe(1);
      const frame = fmt.frames[0]!;
      const { info, ifd } = frame;
      expect(info.vars?.tileWidth).toBe(32);
      expect(info.vars?.tileHeight).toBe(32);
      const planarCfg = await ifd.getSingleNumber(
        TiffTag.PlanarConfiguration,
        stream
      );
      expect(planarCfg).toBe(1);
      const testImg = await loadImageFromFrame(frame);
      await compareImages(testImg, shapesName, (fact, need) => {
        expect(fact).toBe(need);
      });
    });
  });

  it("TIFF tiled planar", async () => {
    await onStreamFromGallery(
      "tiff/shapes_uncompressed_tiled_planar.tif",
      async (stream) => {
        const fmt = await FormatTiff.create(stream);
        expect(fmt.frames.length).toBe(1);
        const frame = fmt.frames[0]!;
        const { info, ifd } = frame;
        expect(info.vars?.tileWidth).toBe(32);
        expect(info.vars?.tileHeight).toBe(32);
        const planarCfg = await ifd.getSingleNumber(
          TiffTag.PlanarConfiguration,
          stream
        );
        expect(planarCfg).toBe(2);
        const testImg = await loadImageFromFrame(frame);
        await compareImages(testImg, shapesName, (fact, need) => {
          expect(fact).toBe(need);
        });
      }
    );
  });

  it("TIFF RGB 16", async () => {
    await onStreamFromGallery("tiff/shapes_16.tif", async (stream) => {
      const img = await loadImageByName(stream);
      expect(img.info.fmt.signature).toBe("R16G16B16");
      expect(img.info.vars?.numberFormat).toBe("big endian");
      expect(img.info.vars?.planarConfiguration).toBe("Chunky");
      await compareImages(img, shapesName, (fact, need) => {
        expect(fact).toBe(need);
      });
    });
  });

  it("TIFF RGB 16 planar", async () => {
    await onStreamFromGallery("tiff/shapes_16_planar.tif", async (stream) => {
      const img = await loadImageByName(stream);
      expect(img.info.fmt.signature).toBe("R16G16B16");
      expect(img.info.vars?.numberFormat).toBe("big endian");
      expect(img.info.vars?.planarConfiguration).toBe("Planar");
      await compareImages(img, shapesName, (fact, need) => {
        expect(fact).toBe(need);
      });
    });
  });

  it("TIFF RGB float16", async () => {
    await onStreamFromGallery("tiff/shapes_16fp.tif", async (stream) => {
      const img = await loadImageByName(stream);
      expect(img.info.fmt.signature).toBe("R32G32B32");
      expect(img.info.vars?.numberFormat).toBe("big endian");
      expect(img.info.vars?.planarConfiguration).toBe("Chunky");
      // Похоже что фотошоп применил какую-то гамма-коррекцию, в результате чего изменилась контрастность.
      // await compareImages(img, shapesName, (fact, need) => {
      //   expect(fact).toBe(need);
      // }, {epsiolon: 20})
    });
  });

  it("TIFF RGB float16 planar", async () => {
    await onStreamFromGallery("tiff/shapes_16fp_planar.tif", async (stream) => {
      const img = await loadImageByName(stream);
      expect(img.info.fmt.signature).toBe("R32G32B32");
      expect(img.info.vars?.numberFormat).toBe("big endian");
      expect(img.info.vars?.planarConfiguration).toBe("Planar");
      await compareImages(img, "tiff/shapes_16fp.tif", (fact, need) => {
        expect(fact).toBe(need);
      });
    });
  });

  it("TIFF RGB float24", async () => {
    await onStreamFromGallery("tiff/shapes_3x24fp.tif", async (stream) => {
      const img = await loadImageByName(stream);
      expect(img.info.fmt.signature).toBe("R32G32B32");
      expect(img.info.vars?.numberFormat).toBe("big endian");
      expect(img.info.vars?.planarConfiguration).toBe("Chunky");
      expect(img.info.vars?.floatBitsPerSample).toBe(24);
      await compareImages(img, "tiff/shapes_16fp.tif", (fact, need) => {
        expect(fact).toBe(need);
      });
    });
  });

  it("TIFF Gray 16 predictor", async () => {
    // GIMP can't read this file. Made in PhotoShop CS6
    await onStreamFromGallery("tiff/gray-16-predictor.tif", async (stream) => {
      const img = await loadImageByName(stream);
      expect(img.info.fmt.signature).toBe("G16");
      expect(img.info.vars?.numberFormat).toBe("little endian");
      expect(img.info.vars?.predictor).toBe(3);
      expect(img.info.vars?.compression).toBe("None");
      expect(img.info.vars?.planarConfiguration).toBeUndefined();
      expect(img.info.vars?.floatBitsPerSample).toBeUndefined();
      expect(dumpW(img.getRowBuffer16(0), 0, 3)).toBe("FFF1 FFF1 FFF1");
      expect(dumpW(img.getRowBuffer16(1), 0, 3)).toBe("FFF1 0000 0000");
    });
  });

  it("TIFF Gray 16fp predictor", async () => {
    await onStreamFromGallery(
      "tiff/gray-16fp-predictor.tif",
      async (stream) => {
        const img = await loadImageByName(stream);
        expect(img.info.fmt.signature).toBe("G32");
        expect(img.info.vars?.numberFormat).toBe("little endian");
        expect(img.info.vars?.predictor).toBe(3);
        expect(img.info.vars?.compression).toBe("LZW");
        expect(img.info.vars?.planarConfiguration).toBeUndefined();
        expect(img.info.vars?.floatBitsPerSample).toBe(16);
        expect(dumpFloat32(img.getRowBuffer32(0), 4, 0, 3)).toBe(
          "1.0000 1.0000 1.0000"
        );
        expect(dumpFloat32(img.getRowBuffer32(1), 4, 0, 3)).toBe(
          "1.0000 0.0000 0.0000"
        );
      }
    );
  });

  it("TIFF Gray 24fp predictor", async () => {
    // GIMP can't read this file. Made in PhotoShop CS6
    await onStreamFromGallery(
      "tiff/gray-24fp-predictor.tif",
      async (stream) => {
        const img = await loadImageByName(stream);
        expect(img.info.fmt.signature).toBe("G32");
        expect(img.info.vars?.numberFormat).toBe("big endian");
        expect(img.info.vars?.predictor).toBe(3);
        expect(img.info.vars?.compression).toBe("LZW");
        expect(img.info.vars?.planarConfiguration).toBeUndefined();
        expect(img.info.vars?.floatBitsPerSample).toBe(24);
        expect(dumpFloat32(img.getRowBuffer32(0), 4, 0, 3)).toBe(
          "1.0000 1.0000 1.0000"
        );
        expect(dumpFloat32(img.getRowBuffer32(1), 4, 0, 3)).toBe(
          "1.0000 0.0000 0.0000"
        );
      }
    );
  });

  it("TIFF CMYK 16", async () => {
    await onStreamFromGallery("tiff/cmyk-16.tif", async (stream) => {
      const img = await loadImageByName(stream);
      expect(img.info.fmt.signature).toBe("C16M16Y16K16");
      expect(img.info.vars?.numberFormat).toBe("big endian");
      expect(img.info.vars?.compression).toBe("None");
      expect(img.info.vars?.planarConfiguration).toBe("Chunky");
      expect(img.info.vars?.floatBitsPerSample).toBeUndefined();
      expect(dumpW(img.getRowBuffer16(0), 0, 4)).toBe("0000 0000 0000 0000");
      expect(dumpW(img.getRowBuffer16(1), 0, 8)).toBe(
        "0000 0000 0000 0000 FFFF 0000 0000 0000"
      );
      expect(dumpW(img.getRowBuffer16(16), 0, 8)).toBe(
        "0000 0000 0000 0000 0000 FFFF 0000 0000"
      );
    });
  });
  it("TIFF CMYK 16 planar", async () => {
    await onStreamFromGallery("tiff/cmyk-16-planar.tif", async (stream) => {
      const img = await loadImageByName(stream);
      expect(img.info.fmt.signature).toBe("C16M16Y16K16");
      expect(img.info.vars?.numberFormat).toBe("little endian");
      expect(img.info.vars?.compression).toBe("None");
      expect(img.info.vars?.planarConfiguration).toBe("Planar");
      expect(img.info.vars?.floatBitsPerSample).toBeUndefined();
      expect(dumpW(img.getRowBuffer16(0), 0, 4)).toBe("0000 0000 0000 0000");
      expect(dumpW(img.getRowBuffer16(1), 0, 8)).toBe(
        "0000 0000 0000 0000 FFFF 0000 0000 0000"
      );
      expect(dumpW(img.getRowBuffer16(16), 0, 8)).toBe(
        "0000 0000 0000 0000 0000 FFFF 0000 0000"
      );
    });
  });

  it("TIFF CMYK 8", async () => {
    await onStreamFromGallery("tiff/cmyk-8.tif", async (stream) => {
      const img = await loadImageByName(stream);
      expect(img.info.fmt.signature).toBe("C8M8Y8K8");
      expect(img.info.vars?.numberFormat).toBe("big endian");
      expect(img.info.vars?.compression).toBe("LZW");
      expect(img.info.vars?.predictor).toBe(2);
      expect(img.info.vars?.planarConfiguration).toBe("Chunky");
      expect(img.info.vars?.floatBitsPerSample).toBeUndefined();
      expect(dump(img.getRowBuffer(0), 0, 4)).toBe("00 00 00 00");
      expect(dump(img.getRowBuffer(1), 0, 8)).toBe("00 00 00 00 FF 00 00 00"); // white, cyan
      expect(dump(img.getRowBuffer(16), 0, 8)).toBe("00 00 00 00 00 FF 00 00"); // white, magenta
    });
  });
  it("TIFF CMYK 16 planar", async () => {
    await onStreamFromGallery("tiff/cmyk-8-planar.tif", async (stream) => {
      const img = await loadImageByName(stream);
      expect(img.info.fmt.signature).toBe("C8M8Y8K8");
      expect(img.info.vars?.numberFormat).toBe("big endian");
      expect(img.info.vars?.compression).toBe("ZIP");
      expect(img.info.vars?.predictor).toBe(2);
      expect(img.info.vars?.planarConfiguration).toBe("Planar");
      expect(img.info.vars?.floatBitsPerSample).toBeUndefined();
      expect(dump(img.getRowBuffer(0), 0, 4)).toBe("00 00 00 00");
      expect(dump(img.getRowBuffer(1), 0, 8)).toBe("00 00 00 00 FF 00 00 00"); // white, cyan
      expect(dump(img.getRowBuffer(16), 0, 8)).toBe("00 00 00 00 00 FF 00 00"); // white, magenta
    });
  });

  it("TIFF CMYKA 16", async () => {
    await onStreamFromGallery("tiff/cmyka-16.tif", async (stream) => {
      const img = await loadImageByName(stream);
      expect(img.info.fmt.signature).toBe("C16M16Y16K16A16");
      expect(img.info.vars?.numberFormat).toBe("big endian");
      expect(img.info.vars?.compression).toBe("None");
      expect(img.info.vars?.planarConfiguration).toBe("Chunky");
      expect(img.info.vars?.floatBitsPerSample).toBeUndefined();
      expect(dumpW(img.getRowBuffer16(0), 0, 5)).toBe(
        "0000 0000 0000 0000 FFFF"
      );
      expect(dumpW(img.getRowBuffer16(1), 0, 10)).toBe(
        "0000 0000 0000 0000 FFFF 0000 0000 0000 0000 0000"
      );
      expect(dumpW(img.getRowBuffer16(2), 10, 15)).toBe(
        "FFFF 0000 0000 0000 FFFF"
      );
    });
  });

  it("TIFF CMYKA 16 planar", async () => {
    await onStreamFromGallery("tiff/cmyka-16-planar.tif", async (stream) => {
      const img = await loadImageByName(stream);
      expect(img.info.fmt.signature).toBe("C16M16Y16K16A16");
      expect(img.info.vars?.numberFormat).toBe("little endian");
      expect(img.info.vars?.compression).toBe("LZW");
      expect(img.info.vars?.planarConfiguration).toBe("Planar");
      expect(img.info.vars?.floatBitsPerSample).toBeUndefined();
      expect(dumpW(img.getRowBuffer16(0), 0, 5)).toBe(
        "0000 0000 0000 0000 FFFF"
      );
      expect(dumpW(img.getRowBuffer16(1), 0, 10)).toBe(
        "0000 0000 0000 0000 FFFF 0000 0000 0000 0000 0000"
      );
      expect(dumpW(img.getRowBuffer16(2), 10, 15)).toBe(
        "FFFF 0000 0000 0000 FFFF"
      );
    });
  });

  it("TIFF CMYKA 8", async () => {
    await onStreamFromGallery("tiff/cmyka-8.tif", async (stream) => {
      const img = await loadImageByName(stream);
      expect(img.info.fmt.signature).toBe("C8M8Y8K8A8");
      expect(img.info.vars?.numberFormat).toBe("big endian");
      expect(img.info.vars?.compression).toBe("ZIP");
      expect(img.info.vars?.predictor).toBe(2);
      expect(img.info.vars?.planarConfiguration).toBe("Chunky");
      expect(img.info.vars?.floatBitsPerSample).toBeUndefined();
      expect(dump(img.getRowBuffer(0), 0, 5)).toBe("00 00 00 00 FF");
      expect(dump(img.getRowBuffer(1), 0, 10)).toBe(
        "00 00 00 00 FF 00 00 00 00 00"
      );
      expect(dump(img.getRowBuffer(2), 10, 15)).toBe("FF 00 00 00 FF");
    });
  });

  it("TIFF Gray Alpha 32", async () => {
    await onStreamFromGallery("tiff/grayAlpha-32.tif", async (stream) => {
      const img = await loadImageByName(stream);
      expect(img.info.fmt.signature).toBe("G32A32");
      expect(img.info.vars?.numberFormat).toBe("big endian");
      expect(img.info.vars?.compression).toBe("LZW");
      expect(img.info.vars?.predictor).toBe(3);
      expect(img.info.vars?.planarConfiguration).toBe("Chunky");
      expect(img.info.vars?.floatBitsPerSample).toBeUndefined();
      expect(dumpFloat32(img.getRowBuffer32(0), 3, 0, 4)).toBe(
        "0.000 1.000 0.000 1.000"
      );
      expect(dumpFloat32(img.getRowBuffer32(2), 2, 0, 6)).toBe(
        "0.00 1.00 0.00 0.00 1.00 1.00"
      );
    });
  });

  it("TIFF Gray Alpha 24 planar", async () => {
    await onStreamFromGallery(
      "tiff/grayAlpha-24-planar.tif",
      async (stream) => {
        const img = await loadImageByName(stream);
        expect(img.info.fmt.signature).toBe("G32A32");
        expect(img.info.vars?.numberFormat).toBe("big endian");
        expect(img.info.vars?.compression).toBe("LZW");
        expect(img.info.vars?.predictor).toBe(3);
        expect(img.info.vars?.planarConfiguration).toBe("Planar");
        expect(img.info.vars?.floatBitsPerSample).toBe(24);
        expect(dumpFloat32(img.getRowBuffer32(0), 3, 0, 4)).toBe(
          "0.000 1.000 0.000 1.000"
        );
        expect(dumpFloat32(img.getRowBuffer32(2), 2, 0, 6)).toBe(
          "0.00 1.00 0.00 0.00 1.00 1.00"
        );
      }
    );
  });
});
