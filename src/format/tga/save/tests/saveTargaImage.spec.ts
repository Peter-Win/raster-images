import { ProgressInfo } from "../../../../Converter";
import { PixelFormat } from "../../../../PixelFormat";
import { SurfaceStd } from "../../../../Surface";
import { BufferStream, streamLock } from "../../../../stream";
import { NodeJSFile } from "../../../../stream/NodeJSFile";
import { getTestFile } from "../../../../tests/getTestFile";
import { TargaImageType, readTargaHeader } from "../../TargaHeader";
import { saveTargaImage } from "../saveTargaImage";
import { testProgress } from "../../../../tests/testProgress";

describe("saveTargaImage", () => {
  it("options", async () => {
    const width = 256;
    const height = 128;
    const image = SurfaceStd.create(width, height, 24);
    for (let y = 0; y < height; y++) {
      const row = image.getRowBuffer(y);
      let pos = 0;
      for (let x = 0; x < width; x++) {
        row[pos++] = 0;
        row[pos++] = x / 2 + y;
        row[pos++] = 0;
      }
    }
    const stream = await getTestFile(__dirname, "image15.tga", "w");
    await saveTargaImage(
      image,
      stream,
      {
        compression: true,
        top2bottom: true,
        right2left: true,
      },
      { dstPixFmt: new PixelFormat("B5G5R5") }
    );
    await streamLock(new NodeJSFile(stream.name, "r"), async (rstream) => {
      const hdr = await readTargaHeader(rstream);
      expect(hdr.imageType).toBe(TargaImageType.rleTrueColor);
      expect(hdr.depth).toBe(16);
      expect(hdr.imageDescriptor).toBe(0x30);
    });
  });

  it("progress", async () => {
    const width = 4;
    const height = 3;
    const img = SurfaceStd.create(width, height, 8, { colorModel: "Gray" });
    const buf = new Uint8Array(1000);
    const stream = new BufferStream(buf, { size: 0 });
    const log: ProgressInfo[] = [];
    await saveTargaImage(
      img,
      stream,
      {},
      {
        progress: testProgress(log),
      }
    );
    expect(log.length).toBe(height + 2);
    expect(log[0]).toEqual({
      step: "write",
      value: 0,
      maxValue: 3,
      y: 0,
      init: true,
    });
    expect(log[1]).toEqual({ step: "write", value: 0, maxValue: 3, y: 2 });
    expect(log[2]).toEqual({ step: "write", value: 1, maxValue: 3, y: 1 });
    expect(log[3]).toEqual({ step: "write", value: 2, maxValue: 3, y: 0 });
    expect(log[4]).toEqual({ step: "write", value: 3, maxValue: 3, y: 3 });
  });
});
