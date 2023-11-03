import { createInfo } from "../../../../ImageInfo";
import { Variables } from "../../../../ImageInfo/Variables";
import { resolutionFromMeters } from "../../../../ImageInfo/resolution";
import { PixelFormat } from "../../../../PixelFormat";
import { SurfaceStd } from "../../../../Surface";
import { BufferStream, streamLock } from "../../../../stream";
import { NodeJSFile } from "../../../../stream/NodeJSFile";
import { dot24, drawSphere } from "../../../../tests/drawSphere";
import { getTestFile } from "../../../../tests/getTestFile";
import {
  FormatForSave,
  formatForSaveFromSurface,
} from "../../../FormatForSave";
import { bmpCoreHeaderSize, readBmpCoreHeader } from "../../BmpCoreHeader";
import { bmpFileHeaderSize } from "../../BmpFileHeader";
import { bmpInfoHeaderSize, readBmpInfoHeader } from "../../BmpInfoHeader";
import { bmpOs2 } from "../../bmpCommon";
import { saveBmpFormat } from "../saveBmpFormat";
import { testProgress } from "../../../../tests/testProgress";
import { ProgressInfo } from "../../../../Converter/ProgressInfo";

describe("saveBmpFormat", () => {
  it("invalid frames count", async () => {
    const f: FormatForSave = {
      frames: [],
    };
    const dstStream = new BufferStream(new Uint8Array(100), { size: 0 });
    await expect(() => saveBmpFormat(f, dstStream)).rejects.toThrowError(
      "Can't write BMP file with 0 frames"
    );
  });

  it("bmp options from image info", async () => {
    const width = 400;
    const height = 300;
    const vars: Variables = {
      rowOrder: "forward",
      resX: 72,
      resY: 80,
      resUnit: "inch",
    };
    const info = createInfo(width, height, 24, "RGB", false, undefined, vars);
    const img = new SurfaceStd(info);
    let pos = 1;
    const dataSize = width * height * 3;
    while (pos < dataSize) {
      img.data[pos] = 64;
      pos += 3;
    }
    drawSphere({
      cx: width / 2,
      cy: height / 2,
      r: height * 0.44,
      ka: 10,
      ks: 20,
      n: 7,
      surface: img,
      dot: dot24([55 / 255, 175 / 255, 212 / 255]),
    });
    const fmt = formatForSaveFromSurface(img);
    const wstream = await getTestFile(__dirname, "fmt-options.bmp", "w");
    await saveBmpFormat(fmt, wstream);
    await streamLock(new NodeJSFile(wstream.name, "r"), async (rstream) => {
      await rstream.seek(bmpFileHeaderSize);
      const buf2 = await rstream.read(bmpInfoHeaderSize);
      const bi = readBmpInfoHeader(buf2.buffer, buf2.byteOffset);
      expect(bi.biSize).toBe(bmpInfoHeaderSize); // non-OS/2
      expect(bi.biHeight).toBe(-height); // rowOrder=forward gives negative height
      expect(resolutionFromMeters(bi.biXPelsPerMeter, "inch")).toBeCloseTo(
        72,
        1
      );
      expect(resolutionFromMeters(bi.biYPelsPerMeter, "inch")).toBeCloseTo(
        80,
        1
      );
    });
  });

  it("bmp OS/2 from image info", async () => {
    const width = 400;
    const height = 300;
    const vars: Variables = {
      format: bmpOs2,
    };
    const info = createInfo(width, height, 24, "RGB", false, undefined, vars);
    const img = new SurfaceStd(info);
    for (let y = 0; y < height; y++) {
      const row = img.getRowBuffer(y);
      for (let x = 0; x < width; x++) {
        row[x * 3] = y / 4;
      }
    }
    drawSphere({
      cx: width / 2,
      cy: height / 2,
      r: height * 0.44,
      ka: 10,
      ks: 20,
      n: 7,
      surface: img,
      dot: dot24([0.5, 0, 1]),
    });
    const dstPixFmt = new PixelFormat(8, "Indexed");
    const fmt = formatForSaveFromSurface(img);
    const wstream = await getTestFile(__dirname, "fmt-options-os2.bmp", "w");
    await saveBmpFormat(fmt, wstream, {
      dstPixFmt,
      converterSearchProps: { dithering: false, prefer: "speed" },
    });
    await streamLock(new NodeJSFile(wstream.name, "r"), async (rstream) => {
      await rstream.seek(bmpFileHeaderSize);
      const buf2 = await rstream.read(bmpCoreHeaderSize);
      const bc = readBmpCoreHeader(buf2.buffer, buf2.byteOffset);
      expect(bc.bcSize).toBe(bmpCoreHeaderSize); // OS/2
      expect(bc.bcBitCount).toBe(8);
    });
  });

  it("saveBmpFormat progress", async () => {
    const buf = new Uint8Array(2000);
    const stream = new BufferStream(buf);
    const img = SurfaceStd.create(4, 3, 24);
    const log: ProgressInfo[] = [];
    const progress = testProgress(log);
    const fmt = formatForSaveFromSurface(img);
    await saveBmpFormat(fmt, stream, { progress });
    expect(log.length).toBe(img.height + 2);
  });
});
