import { ProgressInfo } from "../../../../Converter/ProgressInfo";
import { PixelFormat } from "../../../../PixelFormat";
import { SurfaceStd } from "../../../../Surface";
import { BufferStream } from "../../../../stream";
import { bytesToUtf8, subBuffer } from "../../../../utils";
import { testProgress } from "../../../../tests/testProgress";
import { savePnmImage } from "../savePnmImage";

describe("savePnmImage", () => {
  it("plain", async () => {
    const buf = new Uint8Array(1000);
    const stream = new BufferStream(buf, { size: 0 });
    const gray3x2pixels = new Uint8Array([0, 1, 2, 200, 201, 202]);
    const gray3x2 = SurfaceStd.create(3, 2, 8, {
      colorModel: "Gray",
      data: gray3x2pixels,
    });
    await savePnmImage(gray3x2, stream, {
      dataType: "plain",
      comment: "Abcd",
    });
    const size = await stream.getSize();
    const text = bytesToUtf8(subBuffer(buf, 0, size));
    expect(text).toBe(`P2\n# Abcd\n3 2\n255\n0 1 2\n200 201 202\n`);
  });

  it("implicit conversion bgr15 to rgb24", async () => {
    const buf = new Uint8Array(1000);
    const stream = new BufferStream(buf, { size: 0 });
    const bgr15pixels = new Uint16Array([
      0b0111110000000000, // red
      0b0000001111100000, // green
      0b0000000000011111, // blue
      0b0111110000011111, // magenta
    ]);
    const img = SurfaceStd.create(4, 1, 15, {
      data: new Uint8Array(bgr15pixels.buffer, bgr15pixels.byteOffset),
    });
    await savePnmImage(img, stream, { dataType: "plain" });
    const size = await stream.getSize();
    const text = bytesToUtf8(subBuffer(buf, 0, size));
    expect(text).toBe(`P3\n4 1\n255\n255 0 0 0 255 0 0 0 255 255 0 255\n`);
  });

  it("explicit conversion rgb to gray", async () => {
    const buf = new Uint8Array(1000);
    const stream = new BufferStream(buf, { size: 0 });
    const rgbPixels = new Uint8Array(
      [
        [0, 0, 0],
        [15, 15, 15],
        [215, 215, 215],
      ].flatMap((n) => n)
    );
    const img = SurfaceStd.createSign(3, 1, "R8G8B8", {
      data: new Uint8Array(rgbPixels.buffer, rgbPixels.byteOffset),
    });
    await savePnmImage(
      img,
      stream,
      {
        dataType: "plain",
      },
      {
        dstPixFmt: new PixelFormat(8, "Gray"),
      }
    );
    const size = await stream.getSize();
    const text = bytesToUtf8(subBuffer(buf, 0, size));
    expect(text).toBe(`P2\n3 1\n255\n0 15 215\n`);
  });

  it("progress", async () => {
    const width = 2;
    const height = 4;
    const img = SurfaceStd.createSign(width, height, "G8");
    const log: ProgressInfo[] = [];
    const buf = new Uint8Array(1000);
    const stream = new BufferStream(buf, { size: 0 });
    await savePnmImage(
      img,
      stream,
      {},
      {
        progress: testProgress(log),
      }
    );
    expect(log.length).toBe(height + 2);
  });
});
