import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { checkTiffFormat } from "../TiffFileHeader";

describe("checkTiffFormat", () => {
  it("positive", async () => {
    await onStreamFromGallery("tiff/rgba.tiff", async (stream) => {
      expect(await checkTiffFormat(stream)).toBe(true);
    });
  });
  it("negative", async () => {
    await onStreamFromGallery("cheese.gif", async (stream) => {
      expect(await checkTiffFormat(stream)).toBe(false);
    });
  });
});
