import { SurfaceStd } from "../../../Surface";
import { getTestFile } from "../../../tests/getTestFile";
import { saveBmp } from "../../../format/bmp/saveBmp";
import { bmpInfoHeaderSize } from "../../../format/bmp/BmpInfoHeader";
import { bmpFileHeaderSize } from "../../../format/bmp/BmpFileHeader";
import { formatForSaveFromSurface } from "../../../format/FormatForSave";
import { createFloydSteinberg } from "../FloydSteinberg";

describe("FloydSteinberg", () => {
  xit("Gray8toBW", async () => {
    const width = 256;
    const height = 32;
    const img = SurfaceStd.create(width, height, 8, { colorModel: "Gray" });
    for (let y = 0; y < height; y++) {
      const row = img.getRowBuffer(y);
      for (let x = 0; x < width; x++) {
        row[x] = x;
      }
    }
    const stream = await getTestFile(__dirname, "g8t-bw.bmp", "w");
    const fmt = formatForSaveFromSurface(img);
    await saveBmp(fmt, stream);
    const finalSize = await stream.getSize();
    expect(finalSize).toBe(0);
    // await streamLock(stream, () => {

    // })
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
    const srcFmt = formatForSaveFromSurface(srcImg);
    await saveBmp(srcFmt, srcStream);
    const finalSize = await srcStream.getSize();
    expect(finalSize).toBe(
      width * height * 3 + bmpInfoHeaderSize + bmpFileHeaderSize
    );

    const dstImg = SurfaceStd.create(width, height, 16);
    const { startLine, getNew, setError, nextPixel, getX } =
      createFloydSteinberg(width, 3);
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

        wdst[x] = (nc0 >> 3) | ((nc1 >> 2) << 5) | ((nc2 >> 3) << 11);
        nextPixel();
      }
    }
    const dstStream = await getTestFile(__dirname, "dst16.bmp", "w");
    const dstFmt = formatForSaveFromSurface(dstImg);
    await saveBmp(dstFmt, dstStream);
    const dstSize = await dstStream.getSize();
    expect(dstSize).toBe(
      width * height * 2 + bmpFileHeaderSize + bmpInfoHeaderSize + 3 * 4
    );
  });
});
