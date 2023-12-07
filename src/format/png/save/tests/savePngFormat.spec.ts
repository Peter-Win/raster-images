import { paletteEGA } from "../../../../Palette";
import { PixelFormat } from "../../../../PixelFormat";
import { SurfaceStd } from "../../../../Surface";
import { streamLock } from "../../../../stream";
import { NodeJSFile } from "../../../../stream/NodeJSFile";
import { dot24, drawSphere } from "../../../../tests/drawSphere";
import { getTestFile } from "../../../../tests/getTestFile";
import { formatForSaveFromSurface } from "../../../FormatForSave";
import { FormatPng } from "../../FormatPng";
import { savePngFormat } from "../savePngFormat";

describe("savePngFormat", () => {
  it("save png rbg to i4", async () => {
    const width = 400;
    const height = 300;
    const img = SurfaceStd.createSign(width, height, "R8G8B8", {
      vars: { modificationTime: "2024-01-01" },
    });
    drawSphere({
      cx: width / 2,
      cy: height / 2,
      r: Math.min(width, height) * 0.45,
      ka: 10,
      ks: 40,
      n: 6,
      surface: img,
      dot: dot24([1, 0, 0.5]),
    });
    const row0 = img.getRowBuffer(0);
    paletteEGA.forEach((c, i) => {
      dot24([c[2]! / 255, c[1]! / 255, c[0]! / 255])(row0, i, 1);
    });
    const svFormat = formatForSaveFromSurface(img);
    const ws = await getTestFile(__dirname, "fmt-rgb-i4.png", "w");
    await savePngFormat(svFormat, ws, {
      dstPixFmt: new PixelFormat("I4"),
    });
    await streamLock(new NodeJSFile(ws.name, "r"), async (rs) => {
      const rdFormat = await FormatPng.create(rs);
      const { imageFrame } = rdFormat;
      expect(imageFrame.info.fmt.signature).toBe("I4");
      expect(imageFrame.info.vars?.modificationTime).toBe(
        "2024-01-01 00:00:00"
      );
    });
  });
});
