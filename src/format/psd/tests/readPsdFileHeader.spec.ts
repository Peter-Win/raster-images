import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import {
  PsdColorMode,
  readPsdFileHeader,
  signPsdFileHeader,
} from "../PsdFileHeader";

describe("readPsdFileHeader", () => {
  it("I8.psd", async () => {
    await onStreamFromGallery("psd/I8.psd", async (stream) => {
      const hd = await readPsdFileHeader(stream);
      expect(hd.signature).toBe(signPsdFileHeader);
      expect(hd.version).toBe(1);
      expect(hd.nChannels).toBe(1);
      expect(hd.height).toBe(133);
      expect(hd.width).toBe(303);
      expect(hd.depth).toBe(8);
      expect(hd.colorMode).toBe(PsdColorMode.Indexed);
    });
  });

  it("Bitmap.psd", async () => {
    await onStreamFromGallery("psd/Bitmap.psd", async (stream) => {
      const hd = await readPsdFileHeader(stream);
      expect(hd.signature).toBe(signPsdFileHeader);
      expect(hd.version).toBe(1);
      expect(hd.nChannels).toBe(1);
      expect(hd.height).toBe(70);
      expect(hd.width).toBe(133);
      expect(hd.depth).toBe(1); // <--
      expect(hd.colorMode).toBe(PsdColorMode.Bitmap);
    });
  });

  it("CMYK.psd", async () => {
    await onStreamFromGallery("psd/CMYK.psd", async (stream) => {
      const hd = await readPsdFileHeader(stream);
      expect(hd.signature).toBe(signPsdFileHeader);
      expect(hd.version).toBe(1);
      expect(hd.nChannels).toBe(4); // <--
      expect(hd.height).toBe(64);
      expect(hd.width).toBe(64);
      expect(hd.depth).toBe(8);
      expect(hd.colorMode).toBe(PsdColorMode.CMYK);
    });
  });
});
