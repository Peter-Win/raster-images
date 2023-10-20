import { Surface, SurfaceStd } from "../../../Surface";
import { getTestFile } from "../../../tests/getTestFile";
import { drawSphere, dotG8, dotRGB16 } from "../../../tests/drawSphere";
import { saveBmpImage } from "../../../format/bmp/saveBmp";
import { bmpInfoHeaderSize } from "../../../format/bmp/BmpInfoHeader";
import { bmpFileHeaderSize } from "../../../format/bmp/BmpFileHeader";
import { formatForSaveFromSurface } from "../../../format/FormatForSave";
import {
  createFloydSteinberg8,
  createFloydSteinberg16,
} from "../FloydSteinberg";
import { savePnm } from "../../../format/pnm/savePnm";
import { dump } from "../../../utils";
import { createInfoSign } from "../../../ImageInfo";

const writeDemoPnm = async (surface: Surface, fname: string) => {
  const fmt = formatForSaveFromSurface(surface);
  const stream = await getTestFile(__dirname, fname, "w");
  await savePnm(fmt, stream, {});
};

describe("FloydSteinberg", () => {
  it("Gray8toBW", async () => {
    const width = 400;
    const height = 300;
    const srcImg = SurfaceStd.create(width, height, 8, { colorModel: "Gray" });
    srcImg.fill(127);
    drawSphere({
      ka: 10,
      ks: 30,
      n: 4,
      cx: 200,
      cy: 150,
      r: 100,
      surface: srcImg,
      dot: dotG8,
    });
    await writeDemoPnm(srcImg, "g8-bw-src.pgm");

    const dstImg = SurfaceStd.create(width, height, 1, { colorModel: "Gray" });
    const fs = createFloydSteinberg8(width, 1);
    for (let y = 0; y < height; y++) {
      fs.startLine();
      const srcRow = srcImg.getRowBuffer(y); // 1 pixel = 1 byte
      const dstRow = dstImg.getRowBuffer(y); // 8 pixels = 1 byte
      for (let i = 0; i < width; i++) {
        const x = fs.getX();
        const srcValue = srcRow[x]!;
        const newValue = fs.getNew(0, srcValue);
        const dstValue = newValue < 128 ? 0 : 255;
        fs.setError(0, newValue - dstValue);
        if (dstValue) {
          const dstPos = x >> 3;
          const mask = 0x80 >> (x & 7);
          dstRow[dstPos] |= mask;
        }
        fs.nextPixel();
      }
    }
    await writeDemoPnm(dstImg, "g8-bw-dst.pbm");
    const row0 = dstImg.getRowBuffer(0);
    expect(dump(row0.slice(0, 4))).toBe("55 55 55 55");
  });

  it("Dither16", async () => {
    const width = 256;
    const strips: [number, number, number][] = [
      [0, 0, 1],
      [0, 0.5, 1],
      [0, 1, 1],
      [0, 1, 0],
      [1, 1, 0],
      [1, 0.5, 0],
      [1, 0, 0],
      [1, 0, 1],
    ];
    const stripHeight = 10;
    const height = stripHeight * strips.length;
    const srcImg = SurfaceStd.create(width, height, 24);
    for (let y = 0; y < height; y++) {
      const row = srcImg.getRowBuffer(y);
      const iStrip = Math.floor(y / stripHeight);
      const strip = strips[iStrip]!;
      let pos = 0;
      for (let x = 0; x < width; x++) {
        for (let i = 0; i < 3; i++)
          row[pos++] = Math.floor((x * 256 * strip[i]!) / width);
      }
    }

    const srcStream = await getTestFile(__dirname, "src24.bmp", "w");
    await saveBmpImage(srcImg, srcStream);
    const finalSize = await srcStream.getSize();
    expect(finalSize).toBe(
      width * height * 3 + bmpInfoHeaderSize + bmpFileHeaderSize
    );

    const dstImg = SurfaceStd.create(width, height, 16);
    const { startLine, getNew, setError, nextPixel, getX } =
      createFloydSteinberg8(width, 3);
    for (let y = 0; y < height; y++) {
      const srcRow = srcImg.getRowBuffer(y);
      const dstRow = dstImg.getRowBuffer(y);
      const wdst = new Uint16Array(dstRow.buffer, dstRow.byteOffset);
      startLine();
      for (let i = 0; i < width; i++) {
        const x = getX();
        const srcPos = x * 3;
        const c0 = srcRow[srcPos]!;
        const c1 = srcRow[srcPos + 1]!;
        const c2 = srcRow[srcPos + 2]!;
        const nc0 = getNew(0, c0);
        const nc1 = getNew(1, c1);
        const nc2 = getNew(2, c2);
        const d0 = nc0 >> 3; // 12345678 -> 00012345
        const d1 = nc1 >> 2; // 12345678 -> 00123456
        const d2 = nc2 >> 3;
        const e0 = (d0 << 3) | (d0 >> 2); // 12345ooo | oo000123
        const e1 = (d1 << 2) | (d1 >> 4); // 123456oo | oooo0012
        const e2 = (d2 << 3) | (d2 >> 2);
        setError(0, nc0 - e0);
        setError(1, nc1 - e1);
        setError(2, nc2 - e2);

        wdst[x] = d0 | (d1 << 5) | (d2 << 11);
        nextPixel();
      }
    }
    const dstStream = await getTestFile(__dirname, "dst16.bmp", "w");
    await saveBmpImage(dstImg, dstStream);
    const dstSize = await dstStream.getSize();
    expect(dstSize).toBe(
      width * height * 2 + bmpFileHeaderSize + bmpInfoHeaderSize + 3 * 4
    );
  });

  it("RGB16to8", async () => {
    const width = 300;
    const height = 260;
    const srcImg = new SurfaceStd(createInfoSign(width, height, "R16G16B16"));
    const wData = new Uint16Array(srcImg.data.buffer, srcImg.data.byteOffset);

    // fill by blue color [0, 0, 3F], where max sample value is FFFF.
    // so 3F is less then 1, if convert to 8 bit color.
    let fillPos = 2;
    const end = width * height * 3;
    while (fillPos < end) {
      wData[fillPos] = 0xbf;
      fillPos += 3;
    }

    drawSphere({
      cx: width / 2,
      cy: height / 2,
      r: Math.min(width, height) / 2 - 10,
      ka: 10,
      ks: 30,
      n: 4,
      surface: srcImg,
      dot: dotRGB16([0.5, 1, 0]),
    });
    await writeDemoPnm(srcImg, "srcRgb16to8.ppm");

    const dstImgD = new SurfaceStd(createInfoSign(width, height, "R8G8B8"));
    const dstImgN = new SurfaceStd(createInfoSign(width, height, "R8G8B8"));
    const fs = createFloydSteinberg16(width, 3);
    for (let y = 0; y < height; y++) {
      const src = srcImg.getRowBuffer(y);
      const wSrc = new Uint16Array(src.buffer, src.byteOffset);
      const dstN = dstImgN.getRowBuffer(y);
      const dstD = dstImgD.getRowBuffer(y);
      fs.startLine();
      for (let j = 0; j < width; j++) {
        const x = fs.getX();
        let pos = x * 3;
        for (let i = 0; i < 3; i++) {
          const srcValue = wSrc[pos]!;
          const noDitherValue = srcValue >> 8;
          dstN[pos] = noDitherValue;

          const newValue = fs.getNew(i, srcValue);
          const ditherValue = newValue >> 8;
          dstD[pos] = ditherValue;
          const restoredValue = (ditherValue << 8) | ditherValue;
          fs.setError(i, newValue - restoredValue);
          pos++;
        }
        fs.nextPixel();
      }
    }
    // По внешему виду вряд ли возможно отличить полученные изображения.
    // Т.к. 256 оттенков близко к пределу различимости для аппаратуры и глаза человека
    await writeDemoPnm(dstImgN, "dstRgb16to8nodith.ppm");
    await writeDemoPnm(dstImgD, "dstRgb16to8dith.ppm");
    // Но числовые значения пикселей должны отличаться
    expect(dump(dstImgN.getRowBuffer(0).slice(0, 15))).toBe(
      "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00"
    );
    expect(dump(dstImgD.getRowBuffer(0).slice(0, 15))).toBe(
      "00 00 00 00 00 01 00 00 00 00 00 01 00 00 00"
    );
  });
});
