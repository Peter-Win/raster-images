import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { detectPsd } from "../detectPsd";

describe("detectPsd", () => {
  it("success", async () => {
    await onStreamFromGallery("psd/G8x.psd", async (stream) => {
      expect(await detectPsd(stream)).toBe(true);
    });
  });
  it("fail", async () => {
    await onStreamFromGallery("B&W.gif", async (stream) => {
      expect(await detectPsd(stream)).toBe(false);
    });
    await onStreamFromGallery("I8-RLE.tga", async (stream) => {
      expect(await detectPsd(stream)).toBe(false);
    });
  });
});
