import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { FormatPsd } from "../FormatPsd";
import { loadImageFromFrame } from "../../../loadImage";
import { getTestFile } from "../../../tests/getTestFile";
import { savePnmImage } from "../../pnm";
import { saveBmpImage } from "../../bmp/save";
import { dump, dumpA, dumpFloat, dumpW } from "../../../utils";
import { PixelFormat } from "../../../PixelFormat";
import { FramePsdImage } from "../FramePsdImage";

describe("FormatPsd", () => {
  it("Duotone", async () => {
    await onStreamFromGallery("psd/Bitmap.psd", async (stream) => {
      const fmt = await FormatPsd.create(stream);
      expect(fmt.layers.length).toBe(0);
      expect(fmt.frames.length).toBe(1);
      const fr = fmt.frames[0]!;
      expect(fr.type).toBe("image");
      expect(fr.info.fmt.signature).toBe("G1");
      expect(fr.info.size.toString()).toBe("(133, 70)");
      expect(fr.info.vars?.compression).toEqual("RLE");
      expect(fr.offset.toString(16)).toBe("516c");

      const img = await loadImageFromFrame(fr);
      expect(img.size.toString()).toBe("(133, 70)");
      const ws = await getTestFile(__dirname, "bitmap.pbm", "w");
      await savePnmImage(img, ws);
    });
  });

  it("Indexed", async () => {
    await onStreamFromGallery("psd/I8.psd", async (stream) => {
      const fmt = await FormatPsd.create(stream);
      expect(fmt.layers.length).toBe(0);
      expect(fmt.frames.length).toBe(1);
      const fr = fmt.frames[0]!;
      expect(fr.type).toBe("image");
      expect(fr.info.fmt.signature).toBe("I8");
      expect(fr.info.fmt.palette?.length).toBe(256);
      expect(fr.info.size.toString()).toBe("(303, 133)");
      expect(fr.info.vars?.compression).toEqual("RLE");
      expect(fr.offset.toString(16)).toBe("6db0");

      const img = await loadImageFromFrame(fr);
      expect(img.size.toString()).toBe("(303, 133)");
      // pixel 22,111 is red
      const redIndex = img.getRowBuffer(111)[22]!;
      expect(dumpA(img.palette![redIndex]!)).toBe("04 04 FC FF");
      const ws = await getTestFile(__dirname, "indexed.bmp", "w");
      await saveBmpImage(img, ws);
    });
  });

  it("PSD Gray 8", async () => {
    await onStreamFromGallery("psd/G8x.psd", async (stream) => {
      const fmt = await FormatPsd.create(stream);
      expect(fmt.layers.length).toBe(6);
      expect(fmt.frames.length).toBe(7);
      const fr = fmt.frames[0]!;
      expect(fr.type).toBe("image");
      expect(fr.info.fmt.signature).toBe("G8");
      expect(fr.info.size.toString()).toBe("(133, 70)");
      expect(fr.info.vars?.compression).toBe("RLE");
      expect(fr.offset.toString(16)).toBe("290e6");

      const img = await loadImageFromFrame(fr);
      expect(img.size.toString()).toBe("(133, 70)");
      expect(dump(img.getRowBuffer(0).slice(0, 5))).toBe("00 00 00 00 00");
      expect(dump(img.getRowBuffer(1).slice(0, 5))).toBe("00 67 6A 70 7A");
      const ws = await getTestFile(__dirname, "gray8.pgm", "w");
      await savePnmImage(img, ws);
    });
  });

  it("PSD Gray 32", async () => {
    await onStreamFromGallery("psd/G32x.psd", async (stream) => {
      const fmt = await FormatPsd.create(stream);
      expect(fmt.layers.length).toBe(6);
      expect(fmt.frames.length).toBe(7);
      const fr = fmt.frames[0]!;
      expect(fr.type).toBe("image");
      expect(fr.info.fmt.signature).toBe("G32");
      expect(fr.info.size.toString()).toBe("(499, 270)");
      expect(fr.info.vars?.compression).toBe("None");
      expect(fr.offset.toString(16)).toBe("46772");

      const img = await loadImageFromFrame(fr);
      expect(img.size.toString()).toBe("(499, 270)");
      const ddump = (y: number): string => {
        const b = img.getRowBuffer(y);
        const d = new Uint32Array(b.buffer, b.byteOffset);
        const s: string[] = [];
        d.slice(0, 5).forEach((n) => s.push(n.toString(16)));
        return s.join(" ");
      };
      const fdump = (y: number): string => {
        const b = img.getRowBuffer(y);
        const d = new Float32Array(b.buffer, b.byteOffset);
        const s: string[] = [];
        d.slice(0, 5).forEach((n) => s.push(n.toFixed(4)));
        return s.join(" ");
      };
      // image
      // # 0 # # #
      // # # 0 0 #
      // # # # # 0
      expect(ddump(0)).toBe("3f1433ab 0 3f1433ab 3f1433ab 3f1433ab");
      expect(fdump(0)).toBe("0.5789 0.0000 0.5789 0.5789 0.5789");
      expect(fdump(1)).toBe("0.5789 0.5789 0.0000 0.0000 0.5789");
      expect(fdump(2)).toBe("0.5789 0.5789 0.5789 0.5789 0.0000");
      const ws = await getTestFile(__dirname, "gray32.pgm", "w");
      await savePnmImage(img, ws, {}, { dstPixFmt: new PixelFormat("G8") });
    });
  });

  it("PSD RGB 8", async () => {
    await onStreamFromGallery("psd/gif.psd", async (stream) => {
      const fmt = await FormatPsd.create(stream);
      expect(fmt.layers.length).toBe(7);
      expect(fmt.frames.length).toBe(8);
      const fr = fmt.frames[0]!;
      expect(fr).toBeInstanceOf(FramePsdImage);
      expect(fr.type).toBe("image");
      expect(fr.info.fmt.signature).toBe("R8G8B8");
      expect(fr.info.size.toString()).toBe("(303, 133)");
      expect(fr.info.vars?.compression).toBe("RLE");
      expect(fr.offset.toString(16)).toBe("604a4");

      const img = await loadImageFromFrame(fr);
      const row = img.getRowBuffer(0);
      expect(dump(row.slice(0, 6))).toBe("9B AE 24 A5 B6 1B");
    });
  });

  it("PSD RGB 32", async () => {
    await onStreamFromGallery("psd/RGB_3x32.psd", async (stream) => {
      const fmt = await FormatPsd.create(stream);
      expect(fmt.frames.length).toBe(9);

      // image frame
      const imgFrame = fmt.frames[0]! as FramePsdImage;
      expect(String(imgFrame.info.size)).toBe("(99, 70)");
      expect(imgFrame.type).toBe("image");
      expect(imgFrame).toBeInstanceOf(FramePsdImage);
      expect(imgFrame.info.fmt.depth).toBe(3 * 32);
      const img = await loadImageFromFrame(imgFrame);
      const row0 = img.getRowBuffer(0);
      // bytes red: FD FF 7F 3F, green: FF FF 7F 3F, blue: 00 00 80 3F
      expect(dump(row0.slice(0, 12))).toBe(
        "FD FF 7F 3F FF FF 7F 3F 00 00 80 3F"
      );
      const rowL = img.getRowBuffer(69);
      expect(dump(rowL.slice(0, 12))).toBe(
        "AC 1B 80 3F AD 19 F6 3B AE 19 F6 3B"
      );
      const frowL = new Float32Array(rowL.buffer, rowL.byteOffset);
      expect(dumpFloat(frowL, 3, 0, 3)).toBe("1.001 0.008 0.008");
    });
  });

  it("PSD CMYK 8", async () => {
    await onStreamFromGallery("psd/CMYK.psd", async (stream) => {
      const fmt = await FormatPsd.create(stream);
      expect(fmt.frames.length).toBe(2);

      const imgFrame = fmt.frames[0] as FramePsdImage;
      expect(imgFrame).toBeInstanceOf(FramePsdImage);
      expect(imgFrame.offset.toString(16)).toBe("8cde6");
      const img = await loadImageFromFrame(imgFrame);
      expect(img.info.fmt.colorModel).toBe("CMYK");
      expect(img.info.fmt.depth).toBe(32);
      const row0 = img.getRowBuffer(0);
      // cyan = 00 FF FF FF
      expect(dump(row0, 0, 8)).toBe("00 FF FF FF 00 FF FF FF");

      expect(fmt.layers.length).toBe(1);
      const layerFrame = fmt.layers[0]!;
      expect(layerFrame.info.fmt.signature).toBe("C8M8Y8K8A8");
      const layer = await loadImageFromFrame(layerFrame);
      const lrow0 = layer.getRowBuffer(0);
      // cyan + 100% opacity
      expect(dump(lrow0, 0, 10)).toBe("00 FF FF FF FF 00 FF FF FF FF");
    });
  });

  it("PSD CMYK 16", async () => {
    await onStreamFromGallery("psd/cmyk16.psd", async (stream) => {
      // .CCCC.MMMMM.YYYYY.KKKK
      //
      // ..CC..M...M.Y...Y.K..K
      // .C..C.MM.MM..Y.Y..K.K.
      // .C..C.M.M.M...Y...KK..
      // .C..C.M...M...Y...K.K.
      // ..CC..M...M...Y...K..K
      const fmt = await FormatPsd.create(stream);
      expect(fmt.frames.length).toBe(7);

      const frameImg = fmt.frames[0] as FramePsdImage;
      expect(frameImg).toBeInstanceOf(FramePsdImage);
      expect(frameImg.info.fmt.signature).toBe("C16M16Y16K16");
      const img = await loadImageFromFrame(frameImg);
      const row0 = img.getRowBuffer16(0);
      // cyan
      expect(dumpW(row0, 4, 8)).toBe("0000 FFFF FFFF FFFF");

      const layerMagenta = fmt.findLayer("Magenta")!;
      expect(layerMagenta).toBeDefined();
      const imgMagenta = await loadImageFromFrame(layerMagenta);
      const mrow0 = imgMagenta.getRowBuffer16(0);
      // Magenta =	(0,1,0,0)
      expect(dumpW(mrow0, 0, 10)).toBe(
        "FFFF 0000 FFFF FFFF FFFF FFFF 0000 FFFF FFFF FFFF"
      );
    });
  });

  it("PSD RGBA 8", async () => {
    await onStreamFromGallery("psd/x2.psd", async (stream) => {
      const fmt = await FormatPsd.create(stream);
      const { imageFrame } = fmt;
      expect(imageFrame.info.fmt.signature).toBe("R8G8B8A8");
      expect(imageFrame.info.fmt.alpha).toBe(true);
    });
  });
});
