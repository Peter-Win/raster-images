import { readDwordBE } from "../../../stream";
import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { PsdColorMode, readPsdFileHeader } from "../PsdFileHeader";
import { readPsdPalette } from "../psdPalette";
import { dumpA } from "../../../utils";

describe("psdPalette", () => {
  it("readPsdPalette", async () => {
    await onStreamFromGallery("psd/I8.psd", async (stream) => {
      const hd = await readPsdFileHeader(stream);
      expect(hd.colorMode).toBe(PsdColorMode.Indexed);
      const palSize = await readDwordBE(stream);
      expect(palSize).toBe(256 * 3);
      const pal = await readPsdPalette(stream, 256);
      expect(dumpA(pal[0]!)).toBe("00 00 00 FF");
      expect(dumpA(pal[1]!)).toBe("FF FF FF FF");
      expect(dumpA(pal[2]!)).toBe("1A 16 19 FF");
      expect(dumpA(pal[3]!)).toBe("25 19 1D FF");
      expect(dumpA(pal[4]!)).toBe("FC 04 04 FF");
    });
  });
});
