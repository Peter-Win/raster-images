import { readPalette } from "../../../../Palette/readPalette";
import { onStreamFromGallery } from "../../../../tests/streamFromGallery";
import { dump, dumpA } from "../../../../utils";
import { LzwUnpacker } from "../LzwUnpacker";
import { readGifImageDescriptor } from "../../GifImageDescriptor";
import { GifLogicalScreen } from "../../GifLogicalScreen";
import { readByte } from "../../../../stream";
import { ChunkCode } from "../../FormatGif";

describe("LzwUnpacker", () => {
  it("getNextByte", async () => {
    await onStreamFromGallery("I8.gif", async (stream) => {
      await stream.seek(13); // start of color table
      const palette = await readPalette(stream, 256, { rgb: true });
      // row0: 04a678, 04b878, 04b46c, 04bc64
      await stream.seek(0x318);
      const unpacker = new LzwUnpacker(stream, 8);
      const b0 = await unpacker.getNextByte();
      expect(dumpA(palette[b0]!)).toBe("78 A6 04 FF");
      const b1 = await unpacker.getNextByte();
      expect(dumpA(palette[b1]!)).toBe("78 B8 04 FF");
      const b2 = await unpacker.getNextByte();
      expect(dumpA(palette[b2]!)).toBe("6C B4 04 FF");
      const b3 = await unpacker.getNextByte();
      expect(dumpA(palette[b3]!)).toBe("64 BC 04 FF");
    });
  });
  it("black.gif", async () => {
    await onStreamFromGallery("black.gif", async (stream) => {
      const width = 16;
      const height = 4;
      await stream.seek(6);
      const logScreen: GifLogicalScreen = await GifLogicalScreen.read(stream);
      expect(logScreen.width).toBe(width);
      expect(logScreen.height).toBe(height);
      expect(logScreen.colorResolution).toBe(8);
      expect(logScreen.isGlobalTable).toBe(true);
      const { tableSize } = logScreen;
      expect(tableSize).toBe(256);
      const palette = await readPalette(stream, tableSize, { rgb: true });
      expect(dumpA(palette[0]!)).toBe("00 00 00 FF");
      const chunk1 = await stream.read(3);
      expect(dump(chunk1)).toBe("21 F9 04");
      await stream.skip(5);
      const code2 = await readByte(stream);
      expect(code2).toBe(ChunkCode.beginOfImage);
      const descr = await readGifImageDescriptor(stream);
      expect(descr.left).toBe(0);
      expect(descr.top).toBe(0);
      expect(descr.width).toBe(width);
      expect(descr.height).toBe(height);
      const codeSize = await readByte(stream);
      expect(codeSize).toBe(8);
      const unpacker = new LzwUnpacker(stream, codeSize);
      const line = new Uint8Array(width);
      line.fill(0xff);
      await unpacker.readLine(line, width);
      expect(dump(line)).toBe(
        "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00"
      );
    });
  });
});
