import { createInfoSign } from "../../../ImageInfo";
import { Surface, SurfaceStd } from "../../../Surface";
import { copyBytes } from "../../rowOps/copy/copyBytes";
import { dump } from "../../../utils";
import { surfaceConverter } from "../../surfaceConverter";
import { rowsConverter } from "../rowsConverter";

/* eslint no-param-reassign: "off" */

const cvtBGRtoBGRA = (width: number, src: Uint8Array, dst: Uint8Array) => {
  let srcPos = 0;
  let dstPos = 0;
  const dstEnd = width * 4;
  while (dstPos < dstEnd) {
    dst[dstPos++] = src[srcPos++]!;
    dst[dstPos++] = src[srcPos++]!;
    dst[dstPos++] = src[srcPos++]!;
    dst[dstPos++] = 0xff;
  }
};

// The test image is a gradient from 0 to 255.
// Each row is a separate color.
const rowColors: [number, number, number][] = [
  [0, 0, 1], // red
  [0, 1, 0], // green
  [1, 0, 0], // blue
  [1, 1, 1], // white
];
const width = 7;
const height = rowColors.length;
const getPixel = (x: number, y: number): [number, number, number] => {
  const value = (255 * x) / (width - 1);
  const [c0, c1, c2] = rowColors[y]!;
  return [c0 * value, c1 * value, c2 * value];
};
const srcSign = "B8G8R8";
const dstSign = "B8G8R8A8";
const srcInfo = createInfoSign(width, height, srcSign);

const makeTestImage = (): Surface => {
  const srcImage = new SurfaceStd(srcInfo);
  for (let y = 0; y < height; y++) {
    const row = srcImage.getRowBuffer(y);
    for (let x = 0; x < width; x++) {
      const [b, g, r] = getPixel(x, y);
      row[x * 3] = b;
      row[x * 3 + 1] = g;
      row[x * 3 + 2] = r;
    }
  }
  return srcImage;
};

const dumpPixel = (
  img: Surface,
  x: number,
  y: number,
  samples: number
): string => dump(img.getRowBuffer(y).slice(x * samples, (x + 1) * samples));

describe("rowsConverter", () => {
  expect(getPixel(0, 0)).toEqual([0, 0, 0]);
  expect(getPixel(0, height - 1)).toEqual([0, 0, 0]);
  expect(getPixel(width - 1, 0)).toEqual([0, 0, 255]);
  expect(getPixel(width - 1, height - 1)).toEqual([255, 255, 255]);

  // The example of using a converter to read an image.
  it("rowsConverter.writer", async () => {
    // Читаем исходное изображение BGR, а записываем в BGRA
    const dstSurface = SurfaceStd.create(width, height, 32);
    const nextConverter = surfaceConverter(dstSurface);
    const converter = rowsConverter({
      nextConverter,
      srcSign,
      dstSign,
      size: srcInfo.size,
      makeRowCvt: (rowWidth) => (src, dst) => cvtBGRtoBGRA(rowWidth, src, dst),
    });
    const writer = await converter.getRowsWriter(srcInfo);
    for (let y = 0; y < height; y++) {
      // Читающий алгоритм работает с форматом BGR
      const dstRow = await writer.getBuffer(y);
      expect(dstRow.byteLength).toBe(3 * width);
      let dstPos = 0;
      for (let x = 0; x < width; x++) {
        const pixel = getPixel(x, y);
        for (let n = 0; n < 3; n++) {
          dstRow[dstPos++] = pixel[n]!;
        }
      }
      await writer.flushBuffer(y);
    }
    await writer.finish();

    // Теперь поверхность заполнена данными в формате BGRA. Можно проверять
    const testPixel = (x: number, y: number) => dumpPixel(dstSurface, x, y, 4);
    expect(testPixel(0, 0)).toBe("00 00 00 FF");
    expect(testPixel(width - 1, 0)).toBe("00 00 FF FF");
    expect(testPixel(0, height - 1)).toBe("00 00 00 FF");
    expect(testPixel(width - 1, height - 1)).toBe("FF FF FF FF");
  });

  /**
   * Пример записи изображения в файл с применением простого построчного преобразования RGB=>BGR
   */
  it("rowsConverter.read", async () => {
    const srcImage = makeTestImage();
    const testSrcPixel = (x: number, y: number) => dumpPixel(srcImage, x, y, 3);
    expect(testSrcPixel(0, 0)).toBe("00 00 00");
    expect(testSrcPixel(width - 1, 0)).toBe("00 00 FF");
    expect(testSrcPixel(0, height - 1)).toBe("00 00 00");
    expect(testSrcPixel(width - 1, height - 1)).toBe("FF FF FF");

    // Write to dstImg BGRA
    const dstImg = SurfaceStd.createSign(width, height, dstSign);
    const nextConverter = surfaceConverter(srcImage);
    const converter = rowsConverter({
      nextConverter,
      srcSign,
      dstSign,
      size: srcInfo.size,
      makeRowCvt: (rowWidth) => (src, dst) => cvtBGRtoBGRA(rowWidth, src, dst),
    });
    const reader = await converter.getRowsReader();
    for (let y = 0; y < height; y++) {
      const srcRow = await reader.readRow(y);
      expect(srcRow.byteLength).toBe(4 * width); // BGRA row
      const dstRow = dstImg.getRowBuffer(y);
      copyBytes(width * 4, srcRow, 0, dstRow, 0);
    }
    // test dstImg
    const testDstPixel = (x: number, y: number) => dumpPixel(dstImg, x, y, 4);
    expect(testDstPixel(0, 0)).toBe("00 00 00 FF");
    expect(testDstPixel(width - 1, 0)).toBe("00 00 FF FF");
    expect(testDstPixel(width - 1, 1)).toBe("00 FF 00 FF");
    expect(testDstPixel(width - 1, 2)).toBe("FF 00 00 FF");
    expect(testDstPixel(0, height - 1)).toBe("00 00 00 FF");
    expect(testDstPixel(width - 1, height - 1)).toBe("FF FF FF FF");
  });

  // Использование getSurface
  it("rowsConverter.getSurface", async () => {
    const srcImg = makeTestImage();
    const nextConverter = surfaceConverter(srcImg);
    const converter = rowsConverter({
      nextConverter,
      srcSign,
      dstSign,
      size: srcImg.size,
      makeRowCvt: (rowWidth) => (src, dst) => cvtBGRtoBGRA(rowWidth, src, dst),
    });
    const dstImg = await converter.getSurface();
    // test dstImg
    const testDstPixel = (x: number, y: number) => dumpPixel(dstImg, x, y, 4);
    expect(testDstPixel(0, 0)).toBe("00 00 00 FF");
    expect(testDstPixel(width - 1, 0)).toBe("00 00 FF FF");
    expect(testDstPixel(width - 1, 1)).toBe("00 FF 00 FF");
    expect(testDstPixel(width - 1, 2)).toBe("FF 00 00 FF");
    expect(testDstPixel(0, height - 1)).toBe("00 00 00 FF");
    expect(testDstPixel(width - 1, height - 1)).toBe("FF FF FF FF");
  });
});
