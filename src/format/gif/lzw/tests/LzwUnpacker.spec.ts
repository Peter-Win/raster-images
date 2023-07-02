import { readPalette } from "../../../../Palette/readPalette";
import { onStreamFromGallery } from "../../../../tests/streamFromGallery";
import { dumpA } from "../../../../utils";
import { LzwUnpacker } from "../LzwUnpacker";

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
    });
  });
});
