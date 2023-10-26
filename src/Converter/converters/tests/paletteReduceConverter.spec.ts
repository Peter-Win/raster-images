import { paletteEGA } from "../../../Palette";
import { Surface, SurfaceStd } from "../../../Surface";
import { saveBmpImage } from "../../../format/bmp";
import { getTestFile } from "../../../tests/getTestFile";
import { dump } from "../../../utils";
import { copyBytes } from "../../rowOps/copy/copyBytes";
import { surfaceConverter } from "../../surfaceConverter";
import { paletteReduceConverter } from "../paletteReduceConverter";
import { quant2Converter } from "../quant2Converter";
import { pack8to4bits } from "../../rowOps/indexed/indexedToIndexedDown";

const saveTestImage = async (surface: Surface, shortName: string) => {
  const stream = await getTestFile(__dirname, shortName, "w");
  await saveBmpImage(surface, stream);
};

describe("paletteReduceConverter", () => {
  it("I8 to I4, 16 colors", async () => {
    // Prepare the test image
    const strypeWidth = 60;
    const width = strypeWidth * 16;
    const height = 100;
    const srcImg = SurfaceStd.create(width, height, 8, {
      colorModel: "Indexed",
      palette: paletteEGA,
    });
    for (let y = 0; y < height; y++) {
      const row = srcImg.getRowBuffer(y);
      for (let x = 0; x < width; x++) {
        row[x] = Math.floor(x / strypeWidth);
      }
    }
    await saveTestImage(srcImg, "i8-i4-src.bmp");
    expect(dump(srcImg.getRowBuffer(height - 1).slice(-2))).toBe("0F 0F");

    // Conversion
    const nextConverter = surfaceConverter(srcImg);
    const converter = paletteReduceConverter({
      nextConverter,
      size: srcImg.size,
      srcSign: "I8",
      dstSign: "I4",
      dithering: false,
      rowOp: pack8to4bits,
    });
    const reader = await converter.getRowsReader();
    const dstImg = new SurfaceStd(reader.dstInfo);
    for (let y = 0; y < height; y++) {
      const srcRow = await reader.readRow(y);
      const dstRow = dstImg.getRowBuffer(y);
      copyBytes(dstImg.rowSize, srcRow, 0, dstRow, 0);
    }
    await reader.finish();
    await saveTestImage(dstImg, "i8-i4-dst.bmp");
    // check
    expect(dump(dstImg.getRowBuffer(height - 1).slice(-2))).toBe("FF FF");
  });

  it("BGR8 to I4, 16 colors", async () => {
    // Prepare the test image
    const strypeWidth = 60;
    const baseColors: [number, number, number][] = [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
      [1, 0, 1],
    ];
    const width = strypeWidth * baseColors.length;
    const height = 100;
    const srcImg = SurfaceStd.create(width, height, 24);
    for (let y = 0; y < height; y++) {
      const row = srcImg.getRowBuffer(y);
      const k = (y * 255) / (height - 1);
      for (let x = 0; x < width; x++) {
        const color = baseColors[Math.floor(x / strypeWidth)]!;
        for (let i = 0; i < 3; i++) row[x * 3 + i] = Math.round(color[i]! * k);
      }
    }
    await saveTestImage(srcImg, "bgr-i4-src.bmp");
    expect(dump(srcImg.getRowBuffer(height - 1).slice(-3))).toBe("FF 00 FF");

    // Conversion
    const nextConverter = quant2Converter({
      nextConverter: surfaceConverter(srcImg),
      srcSign: srcImg.info.fmt.signature,
      dstSign: "I8",
      size: srcImg.size,
      dithering: false,
    });
    const converter = paletteReduceConverter({
      nextConverter,
      size: srcImg.size,
      srcSign: "I8",
      dstSign: "I4",
      dithering: false,
      rowOp: pack8to4bits,
    });
    const reader = await converter.getRowsReader();
    const dstImg = new SurfaceStd(reader.dstInfo);
    expect(dstImg.palette?.length).toBe(16); // because paletteReduceConverter requested 16 colors from quant2Converter

    for (let y = 0; y < height; y++) {
      const srcRow = await reader.readRow(y);
      const dstRow = dstImg.getRowBuffer(y);
      copyBytes(dstImg.rowSize, srcRow, 0, dstRow, 0);
    }
    await reader.finish();
    await saveTestImage(dstImg, "brg-i4-dst.bmp");
    // check
    expect(dump(dstImg.getRowBuffer(height - 1).slice(-1))).toBe("DD");
  });
});
