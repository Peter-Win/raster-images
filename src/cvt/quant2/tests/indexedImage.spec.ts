/**
 * Example of indexed images generate
 */
import { Surface, SurfaceStd } from "../../../Surface";
import { formatForSaveFromSurface } from "../../../format/FormatForSave";
import { saveBmp } from "../../../format/bmp/saveBmp";
import { streamLock } from "../../../stream";
import { getTestFile } from "../../../tests/getTestFile";
import { Histogram } from "../Histogram";

const makeGradient = (
  width: number,
  height: number,
  c0: [number, number, number],
  c1: [number, number, number]
): Surface => {
  const img = SurfaceStd.create(width, height, 24);
  const L = width + height;
  for (let y = 0; y < height; y++) {
    const row = img.getRowBuffer(y);
    let pos = 0;
    for (let x = 0; x < width; x++) {
      for (let i = 0; i < 3; i++) {
        // limit -- c1[i]-c0[i]
        //     y -- L
        const left = c0[i]! + ((c1[i]! - c0[i]!) * y) / L;
        const right = c0[i]! + ((c1[i]! - c0[i]!) * (width + y)) / L;
        row[pos++] = left + ((right - left) * x) / width;
      }
    }
  }
  return img;
};

const addColors = (hist: Histogram, img: Surface) => {
  const { width, height } = img;
  for (let y = 0; y < height; y++) {
    const row = img.getRowBuffer(y);
    let pos = 0;
    for (let x = 0; x < width; x++) {
      const c0 = row[pos++]!;
      const c1 = row[pos++]!;
      const c2 = row[pos++]!;
      hist.addColor(c0, c1, c2);
    }
  }
};

describe("indexedImage", () => {
  it("no dithering", async () => {
    const stream = await getTestFile(__dirname, "nodither.bmp", "w");
    await streamLock(stream, async () => {
      const width = 400;
      const height = 300;
      const img0 = makeGradient(width, height, [0, 0, 0], [191, 255, 0]);
      const h = new Histogram();
      addColors(h, img0);
      h.makePaletteN();
      const img = SurfaceStd.create(width, height, 8, {
        colorModel: "Indexed",
        palette: h.pal,
      });
      for (let y = 0; y < height; y++) {
        const src = img0.getRowBuffer(y);
        const dst = img.getRowBuffer(y);
        h.cvt(width, src.buffer, src.byteOffset, dst.buffer, dst.byteOffset);
      }
      const fmt = formatForSaveFromSurface(img);
      await saveBmp(fmt, stream);
    });
    const size = await stream.getSize();
    expect(size).not.toBe(0);
  });
  it("dithering", async () => {
    const stream = await getTestFile(__dirname, "dither.bmp", "w");
    await streamLock(stream, async () => {
      const width = 400;
      const height = 300;
      const img0 = makeGradient(width, height, [0, 0, 0], [0, 255, 191]);
      const h = new Histogram();
      addColors(h, img0);
      h.makePaletteN();
      const img = SurfaceStd.create(width, height, 8, {
        colorModel: "Indexed",
        palette: h.pal,
      });
      const [even, odd] = Histogram.createEvenAndOddRowErrs(width);
      for (let y = 0; y < height; y++) {
        const src = img0.getRowBuffer(y);
        const dst = img.getRowBuffer(y);
        h.cvtDither(
          width,
          src.buffer,
          src.byteOffset,
          dst.buffer,
          dst.byteOffset,
          even,
          odd,
          !!(y & 1)
        );
      }
      const fmt = formatForSaveFromSurface(img);
      await saveBmp(fmt, stream);
    });
    const size = await stream.getSize();
    expect(size).not.toBe(0);
  });
});
