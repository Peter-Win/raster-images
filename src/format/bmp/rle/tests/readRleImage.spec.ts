import { ImageInfo } from "../../../../ImageInfo";
import { readPalette } from "../../../../Palette/readPalette";
import { PixelFormat } from "../../../../PixelFormat";
import { Point } from "../../../../math/Point";
import { RAStream } from "../../../../stream/RAStream";
import { onStreamFromGallery } from "../../../../tests/streamFromGallery";
import { PixelDepth } from "../../../../types";
import { readBmpFileHeader } from "../../BmpFileHeader";
import { readBmpInfoHeader } from "../../BmpInfoHeader";
import { readRleImage } from "../readRleImage";
import { SurfaceStd } from "../../../../Surface";
import { Palette } from "../../../../Palette/Palette";
import { driverBmp } from "../../driverBmp";
import { testProgress } from "../../../../tests/testProgress";
import { ProgressInfo } from "../../../../Converter/ProgressInfo";
import { surfaceConverter } from "../../../../Converter/surfaceConverter";

const needPalette: Palette = [
  [0, 0, 0, 0], // 0 black
  [0xff, 0xff, 0xff, 0], // 1 white
  [0xff, 0, 0xff, 0], // 2 magenta
  [0xff, 0, 0, 0], // 3 blue
  [0xff, 0xff, 0, 0], // 4 cyan
  [0, 0xff, 0, 0], // 5 green
  [0, 0xff, 0xff, 0], // 6 yellow
  [0, 0x7f, 0xff, 0], // 7 orange
  [0, 0, 0xff, 0], // 8 red
  [0xff, 0xff, 0xff, 0], // 9 white
];

const needImage: string[] = [
  "00000000",
  "87654320",
  "12345678",
  "88818181",
  "00111188",
  "00000000",
  "00000000",
  "00000000",
];
const dump8 = (row: Uint8Array): string => Array.from(row).join("");

const dump4 = (row: Uint8Array): string =>
  Array.from(row)
    .map((n) => `${n >> 4}${n & 0xf}`)
    .join("");

const load = async (stream: RAStream) => {
  const hdr = await readBmpFileHeader(stream);
  const bi = await readBmpInfoHeader(stream);
  const palette = await readPalette(stream, bi.biClrUsed, { dword: true });
  const srcData = await stream.read(hdr.bfSize - hdr.bfOffBits);
  const info: ImageInfo = {
    size: new Point(bi.biWidth, Math.abs(bi.biHeight)),
    fmt: new PixelFormat({
      colorModel: "Indexed",
      depth: bi.biBitCount as PixelDepth,
      palette,
    }),
  };
  const surface = new SurfaceStd(info);
  const progressLog: ProgressInfo[] = [];
  const converter = surfaceConverter(surface, testProgress(progressLog));
  return {
    srcData,
    converter,
    surface,
    info,
    isUpDown: bi.biHeight < 0,
    progressLog,
  };
};

describe("readRleImage", () => {
  it("read RLE8", async () => {
    await onStreamFromGallery("I8-RLE.bmp", async (stream) => {
      const params = await load(stream);
      const { surface } = params;
      expect(params.isUpDown).toBe(false);
      expect(surface.width).toBe(8);
      expect(surface.height).toBe(8);
      expect(surface.bitsPerPixel).toBe(8);
      expect(surface.colorModel).toBe("Indexed");
      expect(surface.info.fmt.palette?.length).toBe(10);
      const p = surface.info.fmt.palette!;
      expect(p).toEqual(needPalette);
      expect(Array.from(params.srcData.slice(0, 4))).toEqual([0, 2, 2, 3]);
      await readRleImage(params);
      for (let i = 0; i < surface.height; i++) {
        expect(dump8(surface.getRowBuffer(i))).toBe(needImage[i]);
      }
      expect(params.progressLog.length).toBe(surface.height + 2);
    });
  });
  it("RLE8 Frame", async () => {
    await onStreamFromGallery("I8-RLE.bmp", async (stream) => {
      const isBmp = await driverBmp.detect(stream);
      expect(isBmp).toBe(true);
      const fmt = await driverBmp.createFormat(stream);
      expect(fmt.frames.length).toBe(1);
      const frame = fmt.frames[0]!;
      expect(frame.info.size).toEqual({ x: 8, y: 8 });
      expect(frame.info.fmt.depth).toBe(8);
      expect(frame.offset).toBe(0x5e);
      expect(frame.size).toBe(46);

      const surface = new SurfaceStd(frame.info);
      const converter = surfaceConverter(surface);
      await frame.read(converter);
      for (let i = 0; i < surface.height; i++) {
        expect(dump8(surface.getRowBuffer(i))).toBe(needImage[i]);
      }
    });
  });

  it("read RLE4", async () => {
    await onStreamFromGallery("I4-RLE.bmp", async (stream) => {
      const params = await load(stream);
      const { surface } = params;
      expect(params.isUpDown).toBe(false);
      expect(surface.width).toBe(8);
      expect(surface.height).toBe(8);
      expect(surface.bitsPerPixel).toBe(4);
      expect(surface.colorModel).toBe("Indexed");
      expect(surface.info.fmt.palette?.length).toBe(9);
      const p = surface.info.fmt.palette!;
      expect(p).toEqual(needPalette.slice(0, 9));
      expect(Array.from(params.srcData.slice(0, 4))).toEqual([0, 2, 2, 3]);
      await readRleImage(params);
      for (let i = 0; i < surface.height; i++) {
        expect(dump4(surface.getRowBuffer(i))).toBe(needImage[i]);
      }
    });
  });
  it("RLE4 Frame", async () => {
    await onStreamFromGallery("I4-RLE.bmp", async (stream) => {
      const isBmp = await driverBmp.detect(stream);
      expect(isBmp).toBe(true);
      const fmt = await driverBmp.createFormat(stream);
      expect(fmt.frames.length).toBe(1);
      const frame = fmt.frames[0]!;
      expect(frame.info.size).toEqual({ x: 8, y: 8 });
      expect(frame.info.fmt.depth).toBe(4);
      expect(frame.offset).toBe(0x5a);
      expect(frame.size).toBe(38);

      const surface = new SurfaceStd(frame.info);
      const progressLog: ProgressInfo[] = [];
      const converter = surfaceConverter(surface, testProgress(progressLog));
      await frame.read(converter);
      for (let i = 0; i < surface.height; i++) {
        expect(dump4(surface.getRowBuffer(i))).toBe(needImage[i]);
      }
      const maxValue = surface.height;
      expect(progressLog[0]).toEqual({
        step: "read",
        value: 0,
        y: 0,
        maxValue,
        init: true,
      });
      expect(progressLog.at(-1)).toEqual({
        step: "read",
        value: maxValue,
        y: maxValue,
        maxValue,
      });
    });
  });
});
