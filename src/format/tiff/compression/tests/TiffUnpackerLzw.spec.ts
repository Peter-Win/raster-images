import { onStreamFromGallery } from "../../../../tests/streamFromGallery";
import { dump } from "../../../../utils";
import { FormatTiff } from "../../FormatTiff";
import { TiffTag } from "../../TiffTag";
import { getIfdNumbers } from "../../ifd/IfdEntry";
import { TiffUnpackerLzw } from "../TiffUnpackerLzw";
import { TiffPredictor, createTiffPredictor } from "../TiffPredictor";
import { loadImageFromFrame } from "../../../../loadImage";

describe("TiffUnpackerLzw", () => {
  it("tiff/rgb-lzw.tif", async () => {
    //    0       1       2      3
    // a2b5f1, a2b5f1, a2b5f1, a5b4f3
    await onStreamFromGallery("tiff/rgb-lzw.tif", async (stream) => {
      const fmt = await FormatTiff.create(stream);
      const { littleEndian } = fmt;
      const fr = fmt.frames[0]!;
      const { ifd, info } = fr;
      expect(info.fmt.depth).toBe(24);
      const eSizes = ifd.getEntry(TiffTag.StripByteCounts);
      const eOffsets = ifd.getEntry(TiffTag.StripOffsets);
      const sizes = await getIfdNumbers(eSizes, stream, littleEndian);
      const offsets = await getIfdNumbers(eOffsets, stream, littleEndian);
      const samplesCount = info.fmt.samples.length;
      const bitsPerSample = info.fmt.bitsPerSample!;
      expect(bitsPerSample).toBeDefined();
      const predictor = createTiffPredictor(
        TiffPredictor.HorizontalDifferencing,
        bitsPerSample,
        samplesCount
      );
      await stream.seek(offsets[0]!);
      const srcData = await stream.read(sizes[0]!);
      const unpk = new TiffUnpackerLzw(info.fmt.depth, srcData);
      const buf = new Uint8Array(3 * 4);
      unpk.unpackRow(buf, 4);
      predictor?.(info.size.x, buf);
      expect(dump(buf)).toBe("A2 B5 F1 A2 B5 F1 A2 B5 F1 A5 B4 F3");
    });
  });

  it("Old-style LZW", async () => {
    await onStreamFromGallery("tiff/rgb-lzwold.tiff", async (stream) => {
      const format = await FormatTiff.create(stream);
      expect(format.frames.length).toBe(1);
      const fr = format.frames[0]!;
      expect(fr.info.vars?.compression).toBe("LZW (old-style)");

      const img = await loadImageFromFrame(fr);
      const row0 = img.getRowBuffer(0);
      expect(dump(row0, 0, 3)).toBe("00 00 00");
      const row180 = img.getRowBuffer(180);
      expect(dump(row180, 170 * 3, 171 * 3)).toBe("7F 00 7F");
    });
  });
});
