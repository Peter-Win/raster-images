import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import {
  TargaImageDescriptor,
  TargaImageType,
  readTargaHeader,
} from "../TargaHeader";

describe("readTargaHeader", () => {
  it("BGR32-RLE.tga", async () => {
    await onStreamFromGallery("BGR32-RLE.tga", async (stream) => {
      const hd = await readTargaHeader(stream);
      expect(hd.idLength).toBe(0);
      expect(hd.colorMapType).toBe(0);
      expect(hd.imageType).toBe(TargaImageType.rleTrueColor);
      expect(hd.colorMapStart).toBe(0);
      expect(hd.colorMapLength).toBe(0);
      expect(hd.colorItemSize).toBe(0);
      expect(hd.x0).toBe(0);
      expect(hd.y0).toBe(0);
      expect(hd.width).toBe(333);
      expect(hd.height).toBe(127);
      expect(hd.depth).toBe(32);
      expect(!!(hd.imageDescriptor & TargaImageDescriptor.right2left)).toBe(
        false
      );
      expect(!!(hd.imageDescriptor & TargaImageDescriptor.top2bottom)).toBe(
        false
      );
      expect(hd.imageDescriptor & TargaImageDescriptor.attrMask).toBe(8);
    });
  });

  it("BGR32.tga", async () => {
    await onStreamFromGallery("BGR32.tga", async (stream) => {
      const hd = await readTargaHeader(stream);
      expect(hd.idLength).toBe(0);
      expect(hd.colorMapType).toBe(0);
      expect(hd.imageType).toBe(TargaImageType.uncompressedTrueColor);
      expect(hd.colorMapStart).toBe(0);
      expect(hd.colorMapLength).toBe(0);
      expect(hd.colorItemSize).toBe(0);
      expect(hd.x0).toBe(0);
      expect(hd.y0).toBe(72);
      expect(hd.width).toBe(97);
      expect(hd.height).toBe(72);
      expect(hd.depth).toBe(32);
      expect(!!(hd.imageDescriptor & TargaImageDescriptor.right2left)).toBe(
        false
      );
      expect(!!(hd.imageDescriptor & TargaImageDescriptor.top2bottom)).toBe(
        true
      );
      expect(hd.imageDescriptor & TargaImageDescriptor.attrMask).toBe(8);
    });
  });

  it("G8-PS.tga", async () => {
    await onStreamFromGallery("G8-PS.tga", async (stream) => {
      const hd = await readTargaHeader(stream);
      expect(hd.idLength).toBe(0);
      expect(hd.colorMapType).toBe(0);
      expect(hd.imageType).toBe(TargaImageType.uncompressedGray);
      expect(hd.colorMapStart).toBe(0);
      expect(hd.colorMapLength).toBe(0);
      expect(hd.colorItemSize).toBe(0);
      expect(hd.x0).toBe(0);
      expect(hd.y0).toBe(0);
      expect(hd.width).toBe(250);
      expect(hd.height).toBe(330);
      expect(hd.depth).toBe(8);
      expect(!!(hd.imageDescriptor & TargaImageDescriptor.right2left)).toBe(
        false
      );
      expect(!!(hd.imageDescriptor & TargaImageDescriptor.top2bottom)).toBe(
        false
      );
      expect(hd.imageDescriptor & TargaImageDescriptor.attrMask).toBe(8);
    });
  });

  it("I8-RLE.tga", async () => {
    await onStreamFromGallery("I8-RLE.tga", async (stream) => {
      const hd = await readTargaHeader(stream);
      expect(hd.idLength).toBe(0);
      expect(hd.colorMapType).toBe(1);
      expect(hd.imageType).toBe(TargaImageType.rleColorMapped);
      expect(hd.colorMapStart).toBe(0);
      expect(hd.colorMapLength).toBe(256);
      expect(hd.colorItemSize).toBe(24);
      expect(hd.x0).toBe(0);
      expect(hd.y0).toBe(0);
      expect(hd.width).toBe(303);
      expect(hd.height).toBe(133);
      expect(hd.depth).toBe(8);
      expect(!!(hd.imageDescriptor & TargaImageDescriptor.right2left)).toBe(
        false
      );
      expect(!!(hd.imageDescriptor & TargaImageDescriptor.top2bottom)).toBe(
        true
      );
      expect(hd.imageDescriptor & TargaImageDescriptor.attrMask).toBe(0);
    });
  });
});
