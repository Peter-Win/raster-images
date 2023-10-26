import { bgr24toG8, rgb24toG8 } from "../rgb24toG8";
import { createInfoSign } from "../../../../ImageInfo";
import { paletteEGA } from "../../../../Palette";
import { Surface, SurfaceStd } from "../../../../Surface";
import { savePnmImage } from "../../../../format/pnm/save";
import { getTestFile } from "../../../../tests/getTestFile";
import { subBuffer } from "../../../../utils";

describe("rgb24toG8", () => {
  it("bgr to gray test", () => {
    const src = new Uint8Array(16 * 3 + 4);
    src.fill(0x55);
    let pos = 2;
    paletteEGA.forEach(([c0, c1, c2]) => {
      src[pos++] = c0;
      src[pos++] = c1;
      src[pos++] = c2;
    });
    const dst = new Uint8Array(16 + 6);
    dst.fill(0xaa);
    bgr24toG8(16, subBuffer(src, 2), subBuffer(dst, 3));
    paletteEGA.forEach((c, i) => {
      expect(`${i}: ${dst[i + 3]}`).toBe(
        `${i}: ${Math.round(0.0722 * c[0] + 0.7152 * c[1] + 0.2126 * c[2])}`
      );
    });
  });

  it("rgb to gray test", () => {
    const src = new Uint8Array(16 * 3 + 4);
    src.fill(0x55);
    let pos = 2;
    paletteEGA.forEach((c) => {
      src[pos++] = c[2]!;
      src[pos++] = c[1]!;
      src[pos++] = c[0]!;
    });
    const dst = new Uint8Array(16 + 6);
    dst.fill(0xaa);
    rgb24toG8(16, subBuffer(src, 2), subBuffer(dst, 3));
    paletteEGA.forEach((c, i) => {
      expect(`${i}: ${dst[i + 3]}`).toBe(
        `${i}: ${Math.round(0.0722 * c[0] + 0.7152 * c[1] + 0.2126 * c[2])}`
      );
    });
  });

  it("file demo", async () => {
    const saveDemoImg = async (img: Surface, shortName: string) => {
      const stream = await getTestFile(__dirname, shortName, "w");
      await savePnmImage(img, stream);
    };

    const w = 48;
    const h = 32;
    const width = w * 4;
    const height = h * 4;
    const srcImg = new SurfaceStd(createInfoSign(width, height, "R8G8B8"));
    for (let y = 0; y < height; y++) {
      let pos = 0;
      const row = srcImg.getRowBuffer(y);
      const palY = Math.floor(y / h);
      for (let x = 0; x < width; x++) {
        const palX = Math.floor(x / w);
        const palPos = palY * 4 + palX;
        const c = paletteEGA[palPos]!;
        row[pos++] = c[2]!;
        row[pos++] = c[1]!;
        row[pos++] = c[0]!;
      }
    }
    const dstImg = SurfaceStd.create(width, height, 8, { colorModel: "Gray" });
    for (let y = 0; y < height; y++) {
      const src = srcImg.getRowBuffer(y);
      const dst = dstImg.getRowBuffer(y);
      rgb24toG8(width, src, dst);
    }
    await saveDemoImg(srcImg, "rgb-g8-src.ppm");
    await saveDemoImg(dstImg, "rgb-g8-dst.pgm");
  });
});
