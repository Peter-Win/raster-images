import { Palette } from "../../../Palette";
import { dumpChunks } from "../../../utils";
import { CvtIndexed8To32 } from "../CvtIndexedToBGR";

test("CvtIndexed8To32", () => {
  const palette: Palette = [];
  const addPal = (b: number, g: number, r: number): number => {
    palette.push([b, g, r, 255]);
    return palette.length - 1;
  };
  const iBlack = addPal(0, 0, 0);
  const iWhite = addPal(255, 255, 255);
  const iBlue = addPal(255, 0, 0);
  const iGreen = addPal(0, 255, 0);
  const iRed = addPal(0, 0, 255);
  const iGray = addPal(128, 128, 128);
  const palCache = CvtIndexed8To32.makePaletteCache(palette);

  //        [-----------------------------------]
  // white, blue, black, gray, red, green, white, gray
  //   0      1     2     3     4     5      6     7
  const start = 1;
  const width = 6;
  const srcPixels = new Uint8Array([
    iWhite,
    iBlue,
    iBlack,
    iGray,
    iRed,
    iGreen,
    iWhite,
    iGray,
  ]);
  const dstPixels = new Uint8Array(4 * srcPixels.length);
  CvtIndexed8To32.cvt(
    width,
    srcPixels.buffer,
    srcPixels.byteOffset + start,
    dstPixels.buffer,
    dstPixels.byteOffset + start * 4,
    palCache
  );
  expect(dumpChunks(4, dstPixels)).toEqual([
    "00 00 00 00", // 0:ignor
    "FF 00 00 FF", // 1:blue
    "00 00 00 FF", // 2:black
    "80 80 80 FF", // 3:gray
    "00 00 FF FF", // 4:red
    "00 FF 00 FF", // 5:green
    "FF FF FF FF", // 6:white
    "00 00 00 00", // 7:ignor
  ]);
});
