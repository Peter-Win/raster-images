import { Palette } from "../../../Palette";
import { dumpChunks } from "../../../utils";
import { CvtIndexed8To24 } from "../CvtIndexedToBGR";

test("CvtIndexed8To24", () => {
  const palette: Palette = [
    [0, 0, 0, 255], // 0 = black
    [255, 255, 255, 255], // 1 = white
    [255, 0, 0, 255], // 2 = blue
    [0, 255, 0, 255], // 3 = green
    [0, 0, 255, 255], // 4 = red
  ];
  const palCache = CvtIndexed8To24.makePaletteCache(palette);
  //       [---------------cvt-----------------]
  // white, white, black, red, red, green, blue, white
  //   0      1      2     3    4     5     6      7
  const srcPixels = new Uint8Array([1, 1, 0, 4, 4, 3, 2, 1]);
  const startPos = 1;
  const width = 6;
  const dstPixels = new Uint8Array(3 * srcPixels.length);
  CvtIndexed8To24.cvt(
    width,
    srcPixels.buffer,
    srcPixels.byteOffset + startPos,
    dstPixels.buffer,
    dstPixels.byteOffset + startPos * 3,
    palCache
  );
  expect(dumpChunks(3, dstPixels)).toEqual([
    "00 00 00", // 0:ignor
    "FF FF FF", // 1:white
    "00 00 00", // 2:black
    "00 00 FF", // 3:red
    "00 00 FF", // 4:red
    "00 FF 00", // 5:green
    "FF 00 00", // 6:blue
    "00 00 00", // 7:ignor
  ]);
});
