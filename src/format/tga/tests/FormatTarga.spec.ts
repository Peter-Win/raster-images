import { surfaceConverter } from "../../../Converter/surfaceConverter";
import { SurfaceStd } from "../../../Surface";
import { getTestFile } from "../../../tests/getTestFile";
import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { dump } from "../../../utils";
import { FormatTarga } from "../FormatTarga";
import { FrameTarga } from "../FrameTarga";
import { AttributesType } from "../extensionArea";
import { readPostageStamp } from "../extensionArea/readPostageStamp";
import { saveTargaImage } from "../save/saveTargaImage";

describe("FormatTarga", () => {
  it("BGR32-RLE.tga", async () => {
    await onStreamFromGallery("BGR32-RLE.tga", async (stream) => {
      const fmt = await FormatTarga.create(stream);
      expect(fmt.frames.length).toBe(1);
      const frame = fmt.frames[0]!;
      const { info } = frame;
      expect(info.size.toString()).toBe("(333, 127)");
      expect(info.fmt.signature).toBe("B8G8R8A8");
      const img = new SurfaceStd(info);
      await frame.read(surfaceConverter(img));
      const lastRow = img.getRowBuffer(info.size.y - 1);
      expect(dump(lastRow.slice(0, 4))).toBe("31 04 01 FF");
      const row15 = img.getRowBuffer(15); // pixel (275, 15) is red
      const ofs275 = 275 * 4;
      expect(dump(row15.slice(ofs275, ofs275 + 4))).toBe("00 00 FF FF");
      const row57 = img.getRowBuffer(57); // pixel (275, 57) is green
      expect(dump(row57.slice(ofs275, ofs275 + 4))).toBe("00 FF 00 FF");
      const row93 = img.getRowBuffer(93); // pixel (275, 93) is blue
      expect(dump(row93.slice(ofs275, ofs275 + 4))).toBe("FF 00 00 FF");
    });
  });

  it("B5G5R5.tga", async () => {
    await onStreamFromGallery("B5G5R5.tga", async (stream) => {
      const fmt = await FormatTarga.create(stream);
      expect(fmt.frames.length).toBe(1);
      const frame = fmt.frames[0]!;
      const { info } = frame;
      expect(info.size.toString()).toBe("(103, 108)");
      expect(info.fmt.signature).toBe("B5G5R5");
      const img = new SurfaceStd(info);
      await frame.read(surfaceConverter(img));
      // in editor: 632900, 633100, 6b3108, 6b3108, 6b3900
      // in file: A0 B0 C0 B0 C1 B4 C1 B4 E0 B4
      // 1011.0000.1010.0000  1011.0000.1100.0000
      // 1.01100.00101.00000   1.01100.00110.00000
      // 01100011 00101001 00000000,  01100011 00110001 00000000
      // 632900, 633100
      const row = img.getRowBuffer(img.height - 1);
      expect(dump(row.slice(0, 10))).toBe("A0 B0 C0 B0 C1 B4 C1 B4 E0 B4");
    });
  });

  // Пока что нашлось мало примеров tga-файлов с использованием EXTENSION AREA
  it("extArea", async () => {
    await onStreamFromGallery("extArea.tga", async (stream) => {
      const fmt = await FormatTarga.create(stream);
      const frame: FrameTarga = fmt.frames[0]!;
      const ea = frame.extArea!;
      expect(ea).toBeDefined();
      expect(ea.authorName).toBe("Ricky True");
      expect(ea.authorComment).toEqual([
        "Sample 8 bit run length compressed black and white image",
      ]);
      expect(ea.dateTime?.toISOString()).toBe("1990-03-24T07:00:00.000Z");
      expect(ea.jobName).toBe("TGA Utilities");
      expect(ea.jobTimeInSeconds).toBe(0);
      expect(ea.softwareID).toBe("TGAEdit");
      expect(ea.softwareVersion).toBe("2.00");
      expect(ea.keyColor).toEqual([0, 0, 0, 0]);
      expect(ea.aspectRatio?.toString()).toBe("0/0");
      expect(ea.gamma?.toString()).toBe("0/0");
      expect(ea.colorCorrectionOffset).toBe(0);
      expect(ea.postageStampOffset).toBe(0x102c);
      expect(ea.scanLineOffset).toBe(0);
      expect(ea.attributesType).toBe(AttributesType.noAlpha);
      const postImg = await readPostageStamp(
        stream,
        ea.postageStampOffset,
        frame.info.fmt
      );
      const postStream = await getTestFile(__dirname, "postStamp.tga", "w");
      await saveTargaImage(postImg, postStream);
    });
  });
});
