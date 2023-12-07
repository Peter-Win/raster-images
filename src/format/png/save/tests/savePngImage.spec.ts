import { SurfaceStd } from "../../../../Surface";
import { Point } from "../../../../math";
import { getTestFile } from "../../../../tests/getTestFile";
import { PngPackLevelStd } from "../OptionsSavePng";
import { savePngImage } from "../savePngImage";
import { testProgress } from "../../../../tests/testProgress";
import { ProgressInfo } from "../../../../Converter";
import { streamLock } from "../../../../stream";
import { NodeJSFile } from "../../../../stream/NodeJSFile";
import { FormatPng } from "../../FormatPng";
import { dump, rangeLimit } from "../../../../utils";
import { loadImageFromFrame } from "../../../../loadImage";
import { PixelFormat } from "../../../../PixelFormat";

describe("savePngImage", () => {
  it("compatible", async () => {
    const width = 400;
    const height = 300;
    const img = SurfaceStd.createSign(width, height, "G8");
    const c = new Point(width / 2, height / 2);
    const k = 255 / (height * 0.47);
    for (let y = 0; y < height; y++) {
      const row = img.getRowBuffer(y);
      for (let x = 0; x < width; x++) {
        row[x] = 255 - rangeLimit(c.dist(new Point(x, y)) * k);
      }
    }
    const wstream = await getTestFile(__dirname, "img-g8.png", "w");
    const log: ProgressInfo[] = [];
    await savePngImage(
      img,
      wstream,
      {
        modificationTime: new Date(2023, 11, 6, 20, 26),
        level: PngPackLevelStd.bestCompression,
      },
      {
        progress: testProgress(log),
      }
    );
    expect(log.length).toBeGreaterThan(0);
    await streamLock(new NodeJSFile(wstream.name, "r"), async (rs) => {
      const fmt = await FormatPng.create(rs);
      const frm = fmt.frames[0]!;
      expect(frm.info.size.x).toBe(width);
      expect(frm.info.size.y).toBe(height);
      expect(frm.info.fmt.signature).toBe("G8");
      expect(frm.info.vars?.modificationTime).toBe("2023-12-06 20:26:00");
    });
  });

  it("incompatible", async () => {
    // save CMYK -> autoconvert to RGB
    const width = 400;
    const height = 300;
    const img = SurfaceStd.createSign(width, height, "C8M8Y8K8");
    const colors = [
      [0, 0xff, 0xff, 0xff], // cyan
      [0xff, 0, 0xff, 0xff], // magenta
      [0xff, 0xff, 0, 0xff],
      [0xff, 0xff, 0xff, 0],
    ];
    const k = colors.length / width;
    for (let y = 0; y < height; y++) {
      const row = img.getRowBuffer(y);
      let pos = 0;
      for (let x = 0; x < width; x++) {
        const ci = Math.floor(x * k);
        for (let i = 0; i < 4; i++) row[pos++] = colors[ci]![i]!;
      }
    }
    const wstream = await getTestFile(__dirname, "img-cmyk-rgb.png", "w");
    await savePngImage(img, wstream);
    await streamLock(new NodeJSFile(wstream.name, "r"), async (rs) => {
      const fmt = await FormatPng.create(rs);
      const frm = fmt.frames[0]!;
      expect(frm.info.fmt.signature).toBe("R8G8B8");
      const dstImg = await loadImageFromFrame(frm);
      const row = dstImg.getRowBuffer(0);
      expect(dump(row, 0, 6)).toBe("00 FF FF 00 FF FF"); // cyan
      const ofs1 = (3 * width) / colors.length;
      expect(dump(row, ofs1, ofs1 + 6)).toBe("FF 00 FF FF 00 FF"); // magenta
    });
  });

  it("change format", async () => {
    const width = 160;
    const height = 120;
    const img = SurfaceStd.createSign(width, height, "R8G8B8");
    const colors = [
      [0xff, 0, 0],
      [0, 0xff, 0],
      [0, 0, 0xff],
    ];
    for (let y = 0; y < height; y++) {
      const row = img.getRowBuffer(y);
      const color = colors[Math.floor((colors.length * y) / height)]!;
      let pos = 0;
      for (let x = 0; x < width; x++) {
        const L = (255 * x) / width;
        for (let i = 0; i < 3; i++) row[pos++] = Math.max(color[i]!, L);
      }
    }
    const wstream = await getTestFile(__dirname, "img-rgb-i8.png", "w");
    // use dstPixFmt to change destination pixel format
    await savePngImage(img, wstream, {}, { dstPixFmt: new PixelFormat("I8") });
    await streamLock(new NodeJSFile(wstream.name, "r"), async (rs) => {
      const fmt = await FormatPng.create(rs);
      const frm = fmt.frames[0]!;
      expect(frm.info.fmt.signature).toBe("I8");
    });
  });
});
