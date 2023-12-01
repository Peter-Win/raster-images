import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { readPsdFileHeader } from "../PsdFileHeader";
import { makePsdImageInfo } from "../makePsdInfo";

describe("makePsdImageInfo", () => {
  it("Bitmap", async () => {
    await onStreamFromGallery("psd/Bitmap.psd", async (stream) => {
      const hdr = await readPsdFileHeader(stream);
      const info = makePsdImageInfo(hdr);
      expect(info.size.toString()).toBe("(133, 70)");
      expect(info.fmt.signature).toBe("G1");
    });
  });
  it("Grayscale 8", async () => {
    await onStreamFromGallery("psd/G8x.psd", async (stream) => {
      const hdr = await readPsdFileHeader(stream);
      const info = makePsdImageInfo(hdr);
      expect(info.size.toString()).toBe("(133, 70)");
      expect(info.fmt.signature).toBe("G8");
    });
  });
  it("Grayscale 16", async () => {
    await onStreamFromGallery("psd/G16x.psd", async (stream) => {
      const hdr = await readPsdFileHeader(stream);
      const info = makePsdImageInfo(hdr);
      expect(info.size.toString()).toBe("(499, 270)");
      expect(info.fmt.signature).toBe("G16");
    });
  });
  it("Grayscale 32", async () => {
    await onStreamFromGallery("psd/G32x.psd", async (stream) => {
      const hdr = await readPsdFileHeader(stream);
      const info = makePsdImageInfo(hdr);
      expect(info.size.toString()).toBe("(499, 270)");
      expect(info.fmt.signature).toBe("G32");
    });
  });
  it("CMYK", async () => {
    await onStreamFromGallery("psd/CMYK.psd", async (stream) => {
      const hdr = await readPsdFileHeader(stream);
      const info = makePsdImageInfo(hdr);
      expect(info.size.toString()).toBe("(64, 64)");
      expect(info.fmt.signature).toBe("C8M8Y8K8");
    });
  });
  it("RGB 8", async () => {
    await onStreamFromGallery("psd/RGBnc.psd", async (stream) => {
      const hdr = await readPsdFileHeader(stream);
      const info = makePsdImageInfo(hdr);
      expect(info.fmt.signature).toBe("R8G8B8");
      expect(info.size.toString()).toBe("(303, 133)");
    });
  });
  it("RGB 16", async () => {
    await onStreamFromGallery("psd/RGB_3x16.psd", async (stream) => {
      const hdr = await readPsdFileHeader(stream);
      const info = makePsdImageInfo(hdr);
      expect(info.fmt.signature).toBe("R16G16B16");
      expect(info.size.toString()).toBe("(133, 70)");
    });
  });
  it("RGB 32", async () => {
    await onStreamFromGallery("psd/RGB_3x32.psd", async (stream) => {
      const hdr = await readPsdFileHeader(stream);
      const info = makePsdImageInfo(hdr);
      expect(info.fmt.signature).toBe("R32G32B32");
      expect(info.size.toString()).toBe("(99, 70)");
    });
  });
  it("palette", async () => {
    await onStreamFromGallery("psd/I8.psd", async (stream) => {
      const hdr = await readPsdFileHeader(stream);
      const info = makePsdImageInfo(hdr);
      expect(info.fmt.signature).toBe("I8");
      expect(info.size.toString()).toBe("(303, 133)");
    });
  });
});
