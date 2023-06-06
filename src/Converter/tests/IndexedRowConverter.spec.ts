import { IndexedRowConverter } from "../IndexedRowConverter";
import { CvtIndexed8To24 } from "../../cvt/indexed/CvtIndexedToBGR";
import { PixelFormat } from "../../PixelFormat";
import { Palette } from "../../Palette";
import { SurfaceStd } from "../../Surface";
import { readImagePattern } from "../../transfer/readImage";
import { SurfaceReader } from "../../transfer/SurfaceReader";
import { dumpChunks } from "../../utils";

const palette: Palette = [];
const addColor = (b: number, g: number, r: number): number => {
  palette.push([b, g, r, 255]);
  return palette.length - 1;
};
const iBlack = addColor(0, 0, 0);
const iWhite = addColor(255, 255, 255);
const iRed = addColor(0, 0, 255);
const iGreen = addColor(0, 255, 0);
const iBlue = addColor(255, 0, 0);
const iCyan = addColor(255, 255, 0);
const iYellow = addColor(0, 255, 255);

const srcPixels = [
  [iBlack, iYellow, iWhite],
  [iRed, iGreen, iBlue],
  [iBlack, iCyan, iWhite],
];

describe("IndexedRowConverter", () => {
  it("reader", async () => {
    const converter = new IndexedRowConverter("I8", "B8G8R8", CvtIndexed8To24);
    const srcFmt = new PixelFormat({
      colorModel: "Indexed",
      depth: 8,
      palette,
    });
    const dstImage = SurfaceStd.create(3, 3, 24);
    const reader = converter.createReader(new SurfaceReader(dstImage));
    await readImagePattern(reader, srcFmt, dstImage, async () => {
      for (let y = 0; y < srcPixels.length; y++) {
        const row = srcPixels[y]!;
        const buf = await reader.getRowBuffer(y);
        for (let x = 0; x < row.length; x++) buf[x] = row[x]!;
        await reader.finishRow(y);
      }
    });
    expect(dumpChunks(3, dstImage.getRowBuffer(0))).toEqual([
      "00 00 00",
      "00 FF FF",
      "FF FF FF",
    ]);
    expect(dumpChunks(3, dstImage.getRowBuffer(1))).toEqual([
      "00 00 FF",
      "00 FF 00",
      "FF 00 00",
    ]);
    expect(dumpChunks(3, dstImage.getRowBuffer(2))).toEqual([
      "00 00 00",
      "FF FF 00",
      "FF FF FF",
    ]);
  });
});
