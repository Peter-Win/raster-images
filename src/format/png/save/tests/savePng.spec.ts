import { Surface, SurfaceStd } from "../../../../Surface";
import { getTestFile } from "../../../../tests/getTestFile";
import { drawSphere, dot24 } from "../../../../tests/drawSphere";
import { savePng } from "../savePng";
import { streamLock } from "../../../../stream";
import { NodeJSFile } from "../../../../stream/NodeJSFile";
import { FormatPng } from "../../FormatPng";
import { getPngTimeFromBuffer } from "../../chunks/PngTime";
import { convertSurface } from "../../../../Converter/convertSurface";
import { createRowsReader } from "../../../../Converter";
import { readPalette } from "../../../../Palette";
import { PngPackLevelStd } from "../OptionsSavePng";

const makeImage = (): Surface => {
  const width = 400;
  const height = 300;
  const surface = SurfaceStd.createSign(width, height, "R8G8B8");
  [
    {
      cx: 155,
      cy: 140,
      r: 120,
      color: [1, 0.5, 0] as [number, number, number],
    },
    {
      cx: 280,
      cy: 185,
      r: 90,
      color: [0.7, 0, 1] as [number, number, number],
    },
  ].forEach(({ r, cx, cy, color }) => {
    drawSphere({
      cx,
      cy,
      r,
      surface,
      dot: dot24(color),
      ka: 10,
      ks: 30,
      n: 5,
    });
  });
  return surface;
};

describe("savePng", () => {
  it("PNG RGB 8", async () => {
    const reader = await createRowsReader(makeImage());
    const stream = await getTestFile(__dirname, "rgb8.png", "w");
    const modificationTime = new Date(2023, 11, 6, 16, 37);
    await savePng(reader, stream, {
      modificationTime,
      level: PngPackLevelStd.bestCompression,
    });
    await streamLock(new NodeJSFile(stream.name, "r"), async (rs) => {
      const fmt = await FormatPng.create(rs);
      const fr = fmt.frames[0]!;

      const chTime = fr.chunks.find(({ type }) => type === "tIME")!;
      expect(chTime).toBeDefined();
      await rs.seek(chTime.dataPosition);
      const tbuf = await rs.read(chTime.length);
      const t = getPngTimeFromBuffer(tbuf);
      expect(t).toEqual({
        year: 2023,
        month: 12,
        day: 6,
        hour: 16,
        minute: 37,
        second: 0,
      });
    });
  });

  it("PNG Indexed 8", async () => {
    const img = await convertSurface(makeImage(), "I8");
    expect(img.info.fmt.signature).toBe("I8");
    expect(img.palette).toBeDefined();
    const reader = await createRowsReader(img);
    const wstream = await getTestFile(__dirname, "i8.png", "w");
    await savePng(reader, wstream);
    await streamLock(new NodeJSFile(wstream.name, "r"), async (rs) => {
      const fmt = await FormatPng.create(rs);
      const fr = fmt.frames[0]!;

      const chPal = fr.chunks.find(({ type }) => type === "PLTE")!;
      expect(chPal).toBeDefined();
      await rs.seek(chPal.dataPosition);
      const pal = await readPalette(rs, chPal.length / 3, { rgb: true });
      expect(pal).toEqual(img.palette);
    });
  });
});
