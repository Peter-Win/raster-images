import { SimpleRowConverter } from "../SimpleRowConverter";
import { Cvt24to32 } from "../../cvt/rgb/Cvt24to32";
import { SurfaceStd } from "../../Surface";
import { SurfaceReader } from "../../transfer/SurfaceReader";
import { readImagePattern } from "../../transfer/readImage";
import { PixelFormat } from "../../PixelFormat";
import { dump, dumpA } from "../../utils";

describe("RowConverter", () => {
  const srcFmt = new PixelFormat("B8G8R8");
  const rowConverter = new SimpleRowConverter(
    srcFmt.signature,
    "B8G8R8A8",
    Cvt24to32
  );
  it("reader", async () => {
    const w = 3;
    const h = 3;
    const dstImage = SurfaceStd.create(w, h, 32);
    for (let f = 0; f < dstImage.data.byteLength; f++) dstImage.data[f] = f;
    const dstReader = new SurfaceReader(dstImage);
    const reader = rowConverter.createReader(dstReader);
    const putColor = (
      buf: Uint8Array,
      pos: number,
      color: "red" | "green" | "blue",
      bright: number
    ): number => {
      let i = pos;
      const dict: Record<"red" | "green" | "blue", [number, number, number]> = {
        red: [0, 0, 1],
        green: [0, 1, 0],
        blue: [1, 0, 0],
      };
      dict[color]!.forEach((maskItem) => {
        // eslint-disable-next-line no-param-reassign
        buf[i++] = maskItem * bright;
      });
      return i;
    };
    const rowBright: number[] = [];
    await readImagePattern(reader, srcFmt, dstImage, async () => {
      for (let y = 0; y < h; y++) {
        const bright = 0xff >> y;
        rowBright.push(bright);
        const buf = await reader.getRowBuffer(y);
        let pos = putColor(buf, 0, "red", bright);
        pos = putColor(buf, pos, "green", bright);
        pos = putColor(buf, pos, "blue", bright);
        await reader.finishRow(y);
      }
    });

    expect(dumpA(rowBright)).toBe("FF 7F 3F");
    // R, G, B
    expect(dump(dstImage.getRowBuffer(0))).toBe(
      "00 00 FF FF 00 FF 00 FF FF 00 00 FF"
    );
    expect(dump(dstImage.getRowBuffer(1))).toBe(
      "00 00 7F FF 00 7F 00 FF 7F 00 00 FF"
    );
    expect(dump(dstImage.getRowBuffer(2))).toBe(
      "00 00 3F FF 00 3F 00 FF 3F 00 00 FF"
    );
  });
});
