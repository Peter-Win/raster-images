import {
  Palette,
  createFreePalette,
  paletteEGA,
  readPalette,
} from "../../../Palette";
import { Surface, SurfaceStd } from "../../../Surface";
import { copyBytes } from "../../rowOps/copy/copyBytes";
import {
  bmpFileHeaderSize,
  readBmpFileHeader,
} from "../../../format/bmp/BmpFileHeader";
import {
  bmpInfoHeaderSize,
  readBmpInfoHeader,
} from "../../../format/bmp/BmpInfoHeader";
import { saveBmpImage } from "../../../format/bmp";
import { streamLock } from "../../../stream";
import { dot24, drawSphere } from "../../../tests/drawSphere";
import { getTestFile } from "../../../tests/getTestFile";
import { dumpA } from "../../../utils";
import { RowsReaderOptions } from "../../Converter";
import { surfaceConverter } from "../../surfaceConverter";
import { quant2Converter } from "../quant2Converter";

const saveTestFile = async (shortName: string, image: Surface) => {
  const wstream = await getTestFile(__dirname, shortName, "w");
  await saveBmpImage(image, wstream);
  return streamLock(
    await getTestFile(__dirname, shortName, "r"),
    async (rstream) => {
      const buf1 = await rstream.read(bmpFileHeaderSize);
      const fileHeader = readBmpFileHeader(buf1.buffer, buf1.byteOffset);
      const buf2 = await rstream.read(bmpInfoHeaderSize);
      const infoHeader = readBmpInfoHeader(buf2.buffer, buf2.byteOffset);
      const palette: Palette | undefined =
        infoHeader.biBitCount <= 8
          ? await readPalette(rstream, 1 << infoHeader.biBitCount, {
              dword: "opaque",
            })
          : undefined;
      return {
        fileHeader,
        infoHeader,
        palette,
      };
    }
  );
};

describe("quant2Converter", () => {
  const width = 400;
  const height = 300;
  const srcImg = SurfaceStd.create(width, height, 24);
  // make a gradient
  for (let y = 0; y < height; y++) {
    const v = Math.round((y * 63) / height);
    const row = srcImg.getRowBuffer(y);
    for (let x = 0; x < width; x++) {
      row[x * 3] = v;
      row[x * 3 + 1] = v;
      row[x * 3 + 2] = v;
    }
  }
  drawSphere({
    surface: srcImg,
    cx: width * 0.4,
    cy: height * 0.48,
    r: Math.min(width, height) * 0.48,
    ka: 10,
    ks: 20,
    n: 4,
    dot: dot24([0, 1, 0]),
  });
  drawSphere({
    surface: srcImg,
    cx: width * 0.75,
    cy: height * 0.69,
    r: Math.min(width, height) * 0.3,
    ka: 10,
    ks: 30,
    n: 8,
    dot: dot24([1, 0, 1]),
  });
  const pal24 = createFreePalette(24);
  pal24[0] = [0, 0, 0, 255];
  pal24[pal24.length - 1] = [255, 255, 255, 255];

  // An example of recording a full-color image into an image with a palette.
  it("quant2Converter.reader", async () => {
    await saveTestFile("q2-src.bmp", srcImg);

    type TestCase = {
      label: string;
      resultFileName: string;
      dithering: boolean;
      opt?: RowsReaderOptions;
    };
    const testCases: TestCase[] = [
      {
        label: "NoDither",
        resultFileName: "q2-reader-dst-nodith.bmp",
        dithering: false,
      },
      {
        label: "Dither",
        resultFileName: "q2-reader-dst-dith.bmp",
        dithering: true,
      },
      {
        label: "EGA",
        resultFileName: "q2-reader-dst-ega.bmp",
        dithering: true,
        opt: { palette: paletteEGA },
      },
      {
        label: "pal24",
        resultFileName: "q2-reader-dst-pal24.bmp",
        dithering: false,
        opt: { palette: pal24 },
      },
    ];

    for (const testCase of testCases) {
      const { label, resultFileName, dithering, opt } = testCase;
      const nextConverter = surfaceConverter(srcImg);
      const converter = quant2Converter({
        nextConverter,
        size: srcImg.size,
        srcSign: "B8G8R8",
        dstSign: "I8",
        dithering,
      });
      const reader = await converter.getRowsReader(opt);
      const dstImg = new SurfaceStd(reader.dstInfo);
      for (let y = 0; y < height; y++) {
        const srcRow = await reader.readRow(y);
        expect(srcRow.byteLength).toBe(width);
        copyBytes(width, srcRow, 0, dstImg.getRowBuffer(y), 0);
      }
      await reader.finish();
      const res = await saveTestFile(resultFileName, dstImg);
      expect(res.infoHeader.biBitCount).toBe(8);
      if (label === "EGA") {
        expect(res.palette).toBeDefined();
        // quant2 работает только с 8-битовыми индексами.
        // А bmp-формат определяет количество элементов из глубины цвета.
        // Так что 16-цветовая палитра всё равно будет расположена в начальной части 256-цвнтовой палитры.
        expect(res.palette!.slice(0, 16)).toEqual(paletteEGA);
      }
      if (label === "pal24") {
        expect(res.palette).toBeDefined();
        // Кастомная палитра из 24 цветов, где задан первый элемент (черный) и последний (белый).
        expect(dumpA(res.palette![0]!)).toBe("00 00 00 FF");
        expect(dumpA(res.palette![23]!)).toBe("FF FF FF FF");
      }
    }
  });

  it("quant2Converter.getSurface", async () => {
    const nextConverter = surfaceConverter(srcImg);
    const converter = quant2Converter({
      nextConverter,
      srcSign: "B8G8R8",
      dstSign: "I8",
      size: srcImg.size,
      dithering: true,
    });
    const dstSurface = await converter.getSurface({ palette: pal24 });
    const { infoHeader } = await saveTestFile("q2-getSurface.bmp", dstSurface);
    expect(infoHeader.biBitCount).toBe(8);
    expect(infoHeader.biClrUsed).toBeLessThanOrEqual(24);
    expect(dstSurface.palette?.length).toBeLessThanOrEqual(24);
  });

  it("quant2Converter.writer", async () => {
    // Более редкая ситуация, когда из файла читается полноцветное изображение, а получаем индексное.
    type WriterTestCase = {
      resultFileName: string;
      dithering: boolean;
      palette?: Readonly<Palette>;
    };
    const wTestCases: WriterTestCase[] = [
      { resultFileName: "q2-writer-dither.bmp", dithering: true },
      { resultFileName: "q2-writer-nodither.bmp", dithering: false },
      {
        resultFileName: "q2-writer-ega.bmp",
        dithering: true,
        palette: paletteEGA,
      },
      {
        resultFileName: "q2-writer-pal24.bmp",
        dithering: false,
        palette: pal24,
      },
    ];
    for (const testCase of wTestCases) {
      const { resultFileName, dithering, palette } = testCase;
      const dstImg = SurfaceStd.create(width, height, 8, {
        colorModel: "Indexed",
        palette,
      });
      const nextConverter = surfaceConverter(dstImg);
      const converter = quant2Converter({
        nextConverter,
        srcSign: "B8G8R8",
        dstSign: "I8",
        size: srcImg.size,
        dithering,
      });
      const writer = await converter.getRowsWriter(srcImg.info);
      for (let y = 0; y < height; y++) {
        const buf = await writer.getBuffer(y);
        expect(buf.byteLength).toBe(width * 3);
        copyBytes(width * 3, srcImg.getRowBuffer(y), 0, buf, 0);
        await writer.flushBuffer(y);
      }
      await writer.finish();
      expect(dstImg.palette).toBeDefined();
      await saveTestFile(resultFileName, dstImg);
    }
  });
});
