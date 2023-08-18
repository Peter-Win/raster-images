import { loadImageByName } from "../loadImageByName";
import { onStreamFromGallery } from "../../tests/streamFromGallery";
import { dump, dumpA } from "../../utils";
import { PixelFormat } from "../../PixelFormat";
import { SwapRedBlue24 } from "../../cvt/rgb/SwapRedBlue";
import { Cvt24to32 } from "../../cvt/rgb/Cvt24to32";
import { CvtGray8toRGB8 } from "../../cvt/gray/CvtGray8toRGB8";
import { SurfaceStd } from "../../Surface";

const cvtStrSrcToMatrix = (src: string): number[][] =>
  src
    .trim()
    .split("\n")
    .map((str: string): string[] => str.trim().split(/\s+/))
    .map((strRow: string[]): number[] => strRow.map((s) => +s))
    .map((row: number[]): number[] => row.map((n) => n + n * 16));

const srcGray = `
    0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0
    0  3  3  3  3  0  0  7  7  7  7  0  0 11 11 11 11  0  0 15 15 15 15  0
    0  3  0  0  0  0  0  7  0  0  0  0  0 11  0  0  0  0  0 15  0  0 15  0
    0  3  3  3  0  0  0  7  7  7  0  0  0 11 11 11  0  0  0 15 15 15 15  0
    0  3  0  0  0  0  0  7  0  0  0  0  0 11  0  0  0  0  0 15  0  0  0  0
    0  3  0  0  0  0  0  7  7  7  7  0  0 11 11 11 11  0  0 15  0  0  0  0
    0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0
`;
const pixelsGray = cvtStrSrcToMatrix(srcGray);

const srcRGB = `
  0  0  0    0  0  0    0  0  0   15  0 15
  0  0  0    0 15  7    0  0  0    0  0  0
  0  0  0    0  0  0    0 15  7    0  0  0
  15 0 15    0  0  0    0  0  0    0  0  0
`;
const pixelsRGB = cvtStrSrcToMatrix(srcRGB);

describe("loadImageByName", () => {
  it("simple RGB", async () => {
    await onStreamFromGallery("plain.ppm", async (stream) => {
      const img = await loadImageByName(stream);
      const { size } = img;
      expect(size.toString()).toBe("(4, 4)");
      expect(img.info.fmt.signature).toBe("R8G8B8");
      for (let y = 0; y < size.y; y++) {
        const row = img.getRowBuffer(y);
        expect(`${y}: ${dump(row)}`).toBe(`${y}: ${dumpA(pixelsRGB[y]!)}`);
      }
    });
  });

  it("RGB with swap", async () => {
    await onStreamFromGallery("plain.ppm", async (stream) => {
      const img = await loadImageByName(stream, 0, new PixelFormat(24, "RGB"));
      const { size } = img;
      expect(size.toString()).toBe("(4, 4)");
      expect(img.info.fmt.signature).toBe("B8G8R8");
      const dstRow = new Uint8Array(3 * 4);
      for (let y = 0; y < size.y; y++) {
        const row = img.getRowBuffer(y);
        SwapRedBlue24.cvt(
          4,
          new Uint8Array(pixelsRGB[y]!),
          0,
          dstRow.buffer,
          0
        );
        expect(`${y}: ${dump(row)}`).toBe(`${y}: ${dump(dstRow)}`);
      }
    });
  });

  it("RGB to RGBA", async () => {
    await onStreamFromGallery("plain.ppm", async (stream) => {
      const img = await loadImageByName(stream, 0, PixelFormat.canvas);
      const { size } = img;
      expect(size.toString()).toBe("(4, 4)");
      expect(img.info.fmt.signature).toBe("R8G8B8A8");
      const cmpRow = new Uint8Array(4 * 4);
      for (let y = 0; y < size.y; y++) {
        const row = img.getRowBuffer(y);
        Cvt24to32.cvt(4, new Uint8Array(pixelsRGB[y]!), 0, cmpRow.buffer, 0);
        expect(`${y}: ${dump(row)}`).toBe(`${y}: ${dump(cmpRow)}`);
      }
    });
  });

  it("simpleGray", async () => {
    await onStreamFromGallery("plain.pgm", async (stream) => {
      const img = await loadImageByName(stream);
      const { size } = img;
      expect(size.toString()).toBe("(24, 7)");
      expect(img.info.fmt.signature).toBe("G8");
      for (let y = 0; y < size.y; y++) {
        const row = img.getRowBuffer(y);
        expect(`${y}: ${dump(row)}`).toBe(`${y}: ${dumpA(pixelsGray[y]!)}`);
      }
    });
  });

  it("Gray to RGB", async () => {
    await onStreamFromGallery("plain.pgm", async (stream) => {
      const img = await loadImageByName(stream, 0, new PixelFormat(24));
      const { size } = img;
      expect(size.toString()).toBe("(24, 7)");
      expect(img.info.fmt.signature).toBe("B8G8R8");
      const cmpRow = new Uint8Array(3 * 24);
      for (let y = 0; y < size.y; y++) {
        const row = img.getRowBuffer(y);
        CvtGray8toRGB8.cvt(
          24,
          new Uint8Array(pixelsGray[y]!),
          0,
          cmpRow.buffer,
          0
        );
        expect(`${y}: ${dump(row)}`).toBe(`${y}: ${dump(cmpRow)}`);
      }
    });
  });

  it("Gray to surface", async () => {
    await onStreamFromGallery("plain.pgm", async (stream) => {
      const img = SurfaceStd.create(24, 7, 24);
      const { size } = img;
      expect(img.info.fmt.signature).toBe("B8G8R8");
      await loadImageByName(stream, 0, img);
      const cmpRow = new Uint8Array(3 * size.x);
      for (let y = 0; y < size.y; y++) {
        const row = img.getRowBuffer(y);
        CvtGray8toRGB8.cvt(
          24,
          new Uint8Array(pixelsGray[y]!),
          0,
          cmpRow.buffer,
          0
        );
        expect(`${y}: ${dump(row)}`).toBe(`${y}: ${dump(cmpRow)}`);
      }
    });
  });
});
