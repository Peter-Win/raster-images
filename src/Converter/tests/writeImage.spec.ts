import { SurfaceStd } from "../../Surface";
import { streamLock } from "../../stream";
import { dot24, drawSphere } from "../../tests/drawSphere";
import { getTestFile } from "../../tests/getTestFile";
import { testProgress } from "../../tests/testProgress";
import { utf8ToBytes } from "../../utils";
import { ProgressInfo } from "../ProgressInfo";
import { stdRowOrder } from "../rowOrder";
import { surfaceConverter } from "../surfaceConverter";
import { writeImage } from "../writeImage";

describe("writeImage", () => {
  const width = 120;
  const height = 80;
  const srcImg = SurfaceStd.createSign(width, height, "R8G8B8");
  interface SphParams {
    cx: number;
    cy: number;
    r: number;
    color: [number, number, number];
  }
  const spheres: SphParams[] = [
    { cx: 0.3, cy: 0.4, r: 0.38, color: [1, 0, 0] },
    { cx: 0.55, cy: 0.54, r: 0.33, color: [0, 1, 0] },
    { cx: 0.8, cy: 0.7, r: 0.28, color: [0, 0, 1] },
  ];
  spheres.forEach(({ cx, cy, r, color }) =>
    drawSphere({
      surface: srcImg,
      cx: width * cx,
      cy: height * cy,
      r: Math.min(width, height) * r,
      ka: 10,
      ks: 20,
      n: 4,
      dot: dot24(color),
    })
  );

  it("forward", async () => {
    const log: ProgressInfo[] = [];
    const converter = surfaceConverter(srcImg, testProgress(log));
    const reader = await converter.getRowsReader();
    const dstStream = await getTestFile(__dirname, "writeImageFwd.ppm", "w");
    const header = `P6\n# writeImage.spec.ts - forward rows order\n${width} ${height}\n255\n`;
    await streamLock(dstStream, async () => {
      await dstStream.write(utf8ToBytes(header));
      const writeRow = async (row: Uint8Array) => {
        expect(row.byteLength).toBe(3 * width);
        await dstStream.write(row);
      };
      await writeImage(reader, writeRow, {
        progress: testProgress(log),
      });
    });
    expect(await dstStream.getSize()).toBe(header.length + width * height * 3);
    expect(log[0]).toEqual({
      step: "write",
      value: 0,
      y: 0,
      maxValue: height,
      init: true,
    });
    expect(log[1]).toEqual({ step: "write", value: 0, y: 0, maxValue: height });
    expect(log[2]).toEqual({ step: "write", value: 1, y: 1, maxValue: height });
    expect(log.at(-2)).toEqual({
      step: "write",
      value: height - 1,
      y: height - 1,
      maxValue: height,
    });
    expect(log.at(-1)).toEqual({
      step: "write",
      value: height,
      y: height,
      maxValue: height,
    });
  });

  it("backward", async () => {
    const log: ProgressInfo[] = [];
    const converter = surfaceConverter(srcImg);
    const reader = await converter.getRowsReader();
    const dstStream = await getTestFile(__dirname, "writeImageBwd.ppm", "w");
    const header = `P6\n# writeImage.spec.ts - backward rows order\n${width} ${height}\n255\n`;
    await streamLock(dstStream, async () => {
      await dstStream.write(utf8ToBytes(header));
      const writeRow = async (row: Uint8Array) => {
        expect(row.byteLength).toBe(3 * width);
        await dstStream.write(row);
      };
      await writeImage(reader, writeRow, {
        rowOrder: stdRowOrder("backward"),
        progress: testProgress(log),
      });
    });
    expect(await dstStream.getSize()).toBe(header.length + width * height * 3);
    expect(log[0]).toEqual({
      step: "write",
      value: 0,
      y: 0,
      maxValue: height,
      init: true,
    });
    expect(log[1]).toEqual({
      step: "write",
      value: 0,
      y: height - 1,
      maxValue: height,
    });
    expect(log[2]).toEqual({
      step: "write",
      value: 1,
      y: height - 2,
      maxValue: height,
    });
    expect(log.at(-2)).toEqual({
      step: "write",
      value: height - 1,
      y: 0,
      maxValue: height,
    });
    expect(log.at(-1)).toEqual({
      step: "write",
      value: height,
      y: height,
      maxValue: height,
    });
  });
});
