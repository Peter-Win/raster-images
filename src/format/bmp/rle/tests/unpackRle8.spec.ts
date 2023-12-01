import { Res, RleContext } from "../rleTypes";
import { unpackRle8 } from "../unpackRle8";
import { onStreamFromGallery } from "../../../../tests/streamFromGallery";
import { readBmpFileHeader } from "../../BmpFileHeader";
import { readBmpInfoHeader } from "../../BmpInfoHeader";

describe("unpackRle8", () => {
  it("I8-RLE", async () => {
    await onStreamFromGallery("I8-RLE.bmp", async (stream) => {
      const hdr = await readBmpFileHeader(stream);
      const bi = await readBmpInfoHeader(stream);
      const width = bi.biWidth;
      expect(width).toBe(8);
      await stream.seek(hdr.bfOffBits);
      const dataSize = hdr.bfSize - hdr.bfOffBits;
      const srcBuf = await stream.read(dataSize);
      const dstBuf = new Uint8Array(width);
      let pos = 0;
      const ctx: RleContext = {
        res: Res.endOfLine,
        x: 0,
        y: 0,
      };
      // line 7. All black
      expect(Array.from(srcBuf.slice(0, 4))).toEqual([0, Res.setPos, 2, 3]);
      dstBuf.fill(0);
      pos = unpackRle8(srcBuf, pos, dstBuf, ctx);
      expect(pos).toBe(4);
      expect(ctx).toEqual({
        res: Res.setPos,
        x: 2,
        y: 3,
      });
      expect(Array.from(dstBuf)).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
      // next line: 7-3 = 4. offset=2
      dstBuf.fill(0);
      // 04 01 02 08 00 00
      pos = unpackRle8(srcBuf, pos, dstBuf, ctx);
      expect(Array.from(dstBuf)).toEqual([0, 0, 1, 1, 1, 1, 8, 8]);
      expect(pos).toBe(10);
      expect(ctx).toEqual({ res: Res.endOfLine, x: 0, y: 0 });
      // 00 08, 08 08 08 01 08 01 08 01, 00 00
      pos = unpackRle8(srcBuf, pos, dstBuf, ctx);
      expect(Array.from(dstBuf)).toEqual([8, 8, 8, 1, 8, 1, 8, 1]);
      expect(pos).toBe(22);
      // 00 08, 01 02 03 04 05 06 07 08, 00 00
      pos = unpackRle8(srcBuf, pos, dstBuf, ctx);
      expect(Array.from(dstBuf)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
      expect(pos).toBe(34);
      //         0  1  2  3  4  5  6  align
      // 00 07, [08 07 06 05 04 03 02, 00] 00 01
      // 34 35   36 37 38 39 40 41 42  43  44 45
      dstBuf.fill(0);
      pos = unpackRle8(srcBuf, pos, dstBuf, ctx);
      expect(Array.from(dstBuf)).toEqual([8, 7, 6, 5, 4, 3, 2, 0]);
      expect(pos).toBe(46);
    });
  });
  it("msdn RLE8", () => {
    // example of an 8-bit compressed bitmap from
    // https://learn.microsoft.com/en-us/windows/win32/gdi/bitmap-compression
    const srcChunks: number[][] = [
      //  0     1
      [0x03, 0x04],
      //  2     3
      [0x05, 0x06],
      //  4     5     6     7     8     9
      [0x00, 0x03, 0x45, 0x56, 0x67, 0x00],
      // 10    11
      [0x02, 0x78],
      // 12    13    14    15
      [0x00, 0x02, 0x05, 0x01],
      // 16    17
      [0x02, 0x78],
      // 18    19
      [0x00, 0x00],
      // 20    21
      [0x09, 0x1e],
      // 22    23
      [0x00, 0x01],
    ];
    const srcNumbers: number[] = srcChunks.flatMap((n) => n);
    const srcBuf = new Uint8Array(srcNumbers);
    const dstLines: number[][] = [
      //  0     1     2
      [
        0x04, 0x04, 0x04,
        //  3     4     5     6     7
        0x06, 0x06, 0x06, 0x06, 0x06,
        //  8     9    10
        0x45, 0x56, 0x67,
        // 11    12
        0x78, 0x78, 0,
      ],
      // move current position 5 right and 1 up
      // 0 1  2  3  4    5     6
      [0, 0, 0, 0, 0, 0x78, 0x78, 0, 0, 0, 0, 0, 0, 0],
      // end of line
      //  0     1     2     3     4     5     6     7     8
      [0x1e, 0x1e, 0x1e, 0x1e, 0x1e, 0x1e, 0x1e, 0x1e, 0x1e, 0, 0, 0, 0, 0],
      // end of RLE bitmap
    ];
    const width = 14;
    const dstBuf = new Uint8Array(width);
    dstBuf.fill(0);
    const ctx: RleContext = {
      res: Res.endOfLine,
      x: 0,
      y: 0,
    };
    // line 0
    let pos = unpackRle8(srcBuf, 0, dstBuf, ctx);
    expect(pos).toBe(16);
    expect(Array.from(dstBuf)).toEqual(dstLines[0]);
    // line 1
    dstBuf.fill(0);
    pos = unpackRle8(srcBuf, pos, dstBuf, ctx);
    expect(pos).toBe(20);
    expect(Array.from(dstBuf)).toEqual(dstLines[1]);
    // line 2
    dstBuf.fill(0);
    ctx.x = 0;
    pos = unpackRle8(srcBuf, pos, dstBuf, ctx);
    expect(pos).toBe(24);
    expect(Array.from(dstBuf)).toEqual(dstLines[2]);
  });
});
