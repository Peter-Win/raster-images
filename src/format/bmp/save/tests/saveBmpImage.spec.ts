import { ProgressInfo } from "../../../../Converter/ProgressInfo";
import { createFreePalette } from "../../../../Palette";
import { PixelFormat } from "../../../../PixelFormat";
import { SurfaceStd } from "../../../../Surface";
import { BufferStream, streamLock } from "../../../../stream";
import { NodeJSFile } from "../../../../stream/NodeJSFile";
import { dot24, dotG8, drawSphere } from "../../../../tests/drawSphere";
import { getTestFile } from "../../../../tests/getTestFile";
import { testProgress } from "../../../../tests/testProgress";
import { bmpFileHeaderSize } from "../../BmpFileHeader";
import { bmpInfoHeaderSize, readBmpInfoHeader } from "../../BmpInfoHeader";
import { saveBmpImage } from "../saveBmpImage";

describe("saveBmpImage", () => {
  it("incompatible bmp format", async () => {
    const width = 400;
    const height = 300;
    const img = SurfaceStd.create(width, height, 8, { colorModel: "Gray" });
    drawSphere({
      surface: img,
      dot: dotG8,
      cx: width / 2,
      cy: height / 2,
      r: height * 0.48,
      ka: 10,
      ks: 30,
      n: 5,
    });
    const wstream = await getTestFile(__dirname, "img-g8.bmp", "w");
    await saveBmpImage(img, wstream);
    await streamLock(new NodeJSFile(wstream.name, "r"), async (rstream) => {
      await rstream.seek(bmpFileHeaderSize);
      const ibuf = await rstream.read(bmpInfoHeaderSize);
      const bi = readBmpInfoHeader(ibuf.buffer, ibuf.byteOffset);
      expect(bi.biBitCount).toBe(8);
    });
  });

  it("change dst pixel format", async () => {
    // RGB Image save as I8 with limited colors
    const width = 400;
    const height = 300;
    const img = SurfaceStd.createSign(width, height, "R8G8B8");
    type C3 = [number, number, number];
    [
      { r: 90, cx: 100, cy: 100, col: [1, 0, 0] as C3 },
      { r: 94, cx: 200, cy: 200, col: [0, 1, 0] as C3 },
      { r: 98, cx: 300, cy: 100, col: [0, 0, 1] as C3 },
    ].forEach(({ cx, cy, r, col }) =>
      drawSphere({
        surface: img,
        dot: dot24(col),
        cx,
        cy,
        r,
        ka: 10,
        ks: 30,
        n: 5,
      })
    );
    const wstream = await getTestFile(__dirname, "img-rgb-i8.bmp", "w");
    const dstPixFmt = new PixelFormat("I8");
    dstPixFmt.setPalette(createFreePalette(128));
    await saveBmpImage(img, wstream, {}, { dstPixFmt });
    await streamLock(new NodeJSFile(wstream.name, "r"), async (rstream) => {
      await rstream.seek(bmpFileHeaderSize);
      const ibuf = await rstream.read(bmpInfoHeaderSize);
      const bi = readBmpInfoHeader(ibuf.buffer, ibuf.byteOffset);
      expect(bi.biBitCount).toBe(8);
      expect(bi.biClrUsed).toBe(128);
    });
  });

  it("saveBmpImage progress", async () => {
    const buf = new Uint8Array(2000);
    const stream = new BufferStream(buf);
    const img = SurfaceStd.create(4, 3, 24);
    const log: ProgressInfo[] = [];
    const progress = testProgress(log);
    await saveBmpImage(img, stream, {}, { progress });
    expect(log.length).toBe(img.height + 2);
  });
});
