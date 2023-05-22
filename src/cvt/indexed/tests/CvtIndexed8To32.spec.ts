import { Palette } from "../../../Palette";
import { CvtIndexed8To32 } from "../CvtIndexedToBGR";

test("CvtIndexed8To32", () => {
  const palette: Palette = [
    [0, 0, 0, 255], // 0 = black
    [255, 255, 255, 255], // 1 = white
    [255, 0, 0, 255], // 2 = blue
    [0, 255, 0, 255], // 3 = green
    [0, 0, 255, 255], // 4 = red
    [128, 128, 128, 255], // 5 = gray
  ];
  const palCache = CvtIndexed8To32.makePaletteCache(palette);

  // black, gray, red, green, blue, white
  const srcPixels = new Uint8Array([0, 5, 4, 3, 2, 1]);
  const dstPixels = new Uint8Array(4 * 6);
  CvtIndexed8To32.cvt(
    6,
    srcPixels.buffer,
    srcPixels.byteOffset,
    dstPixels.buffer,
    dstPixels.byteOffset,
    palCache
  );
  expect(Array.from(dstPixels)).toEqual([
    0, 0, 0, 255, 128, 128, 128, 255, 0, 0, 255, 255, 0, 255, 0, 255, 255, 0, 0,
    255, 255, 255, 255, 255,
  ]);
});
