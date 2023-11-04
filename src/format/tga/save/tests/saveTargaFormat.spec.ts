import { saveTargaFormat } from "../saveTargaFormat";
import { formatForSaveFromSurface } from "../../../FormatForSave";
import { SurfaceStd } from "../../../../Surface";
import { getTestFile } from "../../../../tests/getTestFile";
import { createInfo } from "../../../../ImageInfo";
import { PixelFormat } from "../../../../PixelFormat";
import { BufferStream, streamLock } from "../../../../stream";
import { NodeJSFile } from "../../../../stream/NodeJSFile";
import { TargaImageType, readTargaHeader } from "../../TargaHeader";
import { ProgressInfo } from "../../../../Converter";
import { testProgress } from "../../../../tests/testProgress";

describe("saveTargaFormat", () => {
  it("options", async () => {
    const width = 256;
    const height = 128;
    const info = createInfo(width, height, 24, "RGB", false, undefined, {
      compression: "RLE",
      rowsOrder: "forward",
      rightToLeft: 1,
      orgX: 2,
      orgY: 3,
    });
    const image = new SurfaceStd(info);
    for (let y = 0; y < height; y++) {
      const row = image.getRowBuffer(y);
      let pos = 0;
      for (let x = 0; x < width; x++) {
        const v = x / 2 + y;
        row[pos++] = 0;
        row[pos++] = v;
        row[pos++] = v;
      }
    }
    const stream = await getTestFile(__dirname, "format-bgr-i8.tga", "w");
    const format = formatForSaveFromSurface(image);
    await saveTargaFormat(format, stream, {
      dstPixFmt: new PixelFormat("I8"),
    });
    await streamLock(new NodeJSFile(stream.name, "r"), async (rstream) => {
      const hdr = await readTargaHeader(rstream);
      expect(hdr.imageType).toBe(TargaImageType.rleColorMapped);
      expect(hdr.depth).toBe(8);
      expect(hdr.colorItemSize).toBe(24);
      expect(hdr.x0).toBe(width - 2);
      expect(hdr.y0).toBe(height - 3);
      expect(hdr.imageDescriptor).toBe(0x30);
    });
  });

  it("progress", async () => {
    const width = 4;
    const height = 3;
    const img = SurfaceStd.create(width, height, 8, { colorModel: "Gray" });
    const format = formatForSaveFromSurface(img);
    const buf = new Uint8Array(1000);
    const stream = new BufferStream(buf, { size: 0 });
    const log: ProgressInfo[] = [];
    await saveTargaFormat(format, stream, {
      progress: testProgress(log),
    });
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
