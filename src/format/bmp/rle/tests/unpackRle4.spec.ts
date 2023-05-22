import { onStreamFromGallery } from "../../../../tests/streamFromGallery";
import { bmpFileHeaderSize, readBmpFileHeader } from "../../BmpFileHeader";
import { bmpInfoHeaderSize, readBmpInfoHeader } from "../../BmpInfoHeader";
import { RleContext, Res } from "../rleTypes";
import { unpackRle4 } from "../unpackRle4";

describe("unpackRle4", () => {
  it("I4-RLE", async () => {
    await onStreamFromGallery("I4-RLE.bmp", async (stream) => {
      const hdrBuf = await stream.read(bmpFileHeaderSize);
      const hdr = readBmpFileHeader(hdrBuf.buffer, hdrBuf.byteOffset);
      const biBuf = await stream.read(bmpInfoHeaderSize);
      const bi = readBmpInfoHeader(biBuf.buffer, biBuf.byteOffset);
      const width = bi.biWidth;
      expect(width).toBe(8);
      await stream.seek(hdr.bfOffBits);
      const dataSize = hdr.bfSize - hdr.bfOffBits;
      const srcBuf = await stream.read(dataSize);
      const dstBuf = new Uint8Array(width / 2);
      let pos = 0;
      const ctx: RleContext = {
        res: Res.endOfLine,
        x: 0,
        y: 0,
      };
      dstBuf.fill(0);
      expect(Array.from(srcBuf.slice(0, 4))).toEqual([0, Res.setPos, 2, 3]);
      // 0  1  2  3   4  5   6  7  8  9   10 11
      // 00 02 02 03, 00 06: 11 11 88 00, 00 00
      pos = unpackRle4(srcBuf, pos, dstBuf, ctx);
      expect(pos).toBe(4);
      expect(ctx).toEqual({ res: Res.setPos, x: 2, y: 3 });
      expect(Array.from(dstBuf)).toEqual([0, 0, 0, 0]);

      dstBuf.fill(0);
      pos = unpackRle4(srcBuf, pos, dstBuf, ctx);
      expect(pos).toBe(12);
      const dump = () =>
        Array.from(dstBuf)
          .map((n) => n.toString(16).padStart(2, "0"))
          .join(" ");
      expect(dump()).toEqual("00 11 11 88");
      expect(ctx).toEqual({ res: Res.endOfLine, x: 0, y: 0 });

      // 12 13  14 15 16 17  18 19
      // 00 08: 88 81 81 81, 00 00
      dstBuf.fill(0);
      pos = unpackRle4(srcBuf, pos, dstBuf, ctx);
      expect(pos).toBe(20);
      expect(dump()).toBe("88 81 81 81");
      expect(ctx).toEqual({ res: Res.endOfLine, x: 0, y: 0 });

      // 20 21  22 23 24 25  26 27
      // 00 08: 12 34 56 78, 00 00
      dstBuf.fill(0);
      pos = unpackRle4(srcBuf, pos, dstBuf, ctx);
      expect(pos).toBe(28);
      expect(dump()).toBe("12 34 56 78");

      // 28 29  30 31 32 33  34 35
      // 00 08: 87 65 43 20, 00 01
      dstBuf.fill(0);
      pos = unpackRle4(srcBuf, pos, dstBuf, ctx);
      expect(pos).toBe(36);
      expect(dump()).toBe("87 65 43 20");
    });
  });

  it("msdn RLE4", () => {
    // RLE4 example from
    // https://learn.microsoft.com/en-us/windows/win32/gdi/bitmap-compression
    //               0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 22 23
    const srcDump = `03 04 05 06 00 06 45 56 67 00 04 78 00 02 05 01 04 78 00 00 09 1E 00 01`;
    const srcBuf = new Uint8Array(
      srcDump.split(" ").map((s) => Number.parseInt(s, 16))
    );
    const dstBuf = new Uint8Array(9);
    const dump = () =>
      Array.from(dstBuf)
        .map((n) => n.toString(16).toUpperCase().padStart(2, "0"))
        .join(" ");
    const ctx: RleContext = { res: Res.setPos, x: 0, y: 0 };

    dstBuf.fill(0);
    let pos = unpackRle4(srcBuf, 0, dstBuf, ctx);

    // 0 4 0
    // 0 6 0 6 0
    // 4 5 5 6 6 7
    // 7 8 7 8
    // move current position 5 right and 1 up
    expect(dump()).toBe("04 00 60 60 45 56 67 78 78");
    expect(pos).toBe(16);
    expect(ctx).toEqual({ res: Res.setPos, x: 5, y: 1 });

    // 7 8 7 8
    // end of line
    dstBuf.fill(0);
    pos = unpackRle4(srcBuf, pos, dstBuf, ctx);
    expect(dump()).toBe("00 00 07 87 80 00 00 00 00");
    expect(pos).toBe(20);
    expect(ctx).toEqual({ res: Res.endOfLine, x: 0, y: 0 });

    // 1 E 1 E 1 E 1 E 1
    // end of RLE bitmap
    dstBuf.fill(0);
    pos = unpackRle4(srcBuf, pos, dstBuf, ctx);
    expect(dump()).toBe("1E 1E 1E 1E 10 00 00 00 00");
    expect(pos).toBe(24);
    expect(ctx).toEqual({ res: Res.endOfImage, x: 0, y: 0 });
  });
});
