import { savePnm } from "../savePnm";
import { getTestFile } from "../../../tests/getTestFile";
import { formatForSaveFromSurface } from "../../FormatForSave";
import { SurfaceStd } from "../../../Surface";
import { streamLock } from "../../../stream";
import { bytesToUtf8, dump, dumpA } from "../../../utils";
import { copyWordsToBigEndian } from "../../../cvt/copy/copyWordsToBigEndian";
import { PixelFormat } from "../../../PixelFormat";

const bwSrc: string[] = [
  "******************************************",
  "*                                        *",
  "*  *   *  *****  *      *       ***   *  *",
  "*  *   *  *      *      *      *   *  *  *",
  "*  *****  ****   *      *      *   *  *  *",
  "*  *   *  *      *      *      *   *     *",
  "*  *   *  *****  *****  *****   ***   *  *",
  "*                                        *",
  "******************************************",
];

const bWidth = bwSrc[0]!.length;
const bHeight = bwSrc.length;
const bitmap: number[] = [];
bwSrc.forEach((line) => {
  let mask = 0x80;
  let value = 0;
  Array.from(line).forEach((c) => {
    if (c === "*") value |= mask;
    mask >>= 1;
    if (mask === 0) {
      bitmap.push(value);
      value = 0;
      mask = 0x80;
    }
  });
  if (mask !== 0x80) bitmap.push(value);
});

describe("savePnm", () => {
  // ------------- bitmap

  it("plain bitmap", async () => {
    const img = SurfaceStd.create(bWidth, bHeight, 1, {
      colorModel: "Gray",
      data: new Uint8Array(bitmap),
    });
    const fname = "plain-bw.pbm";
    const wstream = await getTestFile(__dirname, fname, "w");
    await savePnm(formatForSaveFromSurface(img), wstream, {
      dataType: "plain",
      mapFormat: "bitmap",
      comment: "Hello!",
      maxRowLength: 100,
    });
    const size = await wstream.getSize();
    expect(size).not.toBe(0);
    const rstream = await getTestFile(__dirname, fname, "r");
    await streamLock(rstream, async (stream) => {
      const all = await stream.read(size);
      const rows = bytesToUtf8(all).split("\n");
      let i = 0;
      expect(rows[i++]).toBe("P1");
      expect(rows[i++]).toBe("# Hello!");
      expect(rows[i++]).toBe(`${bWidth} ${bHeight}`);
      expect(rows[i++]).toBe(
        "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"
      );
      expect(rows[i++]).toBe(
        "0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0"
      );
      expect(rows[i++]).toBe(
        "0 1 1 0 1 1 1 0 1 1 0 0 0 0 0 1 1 0 1 1 1 1 1 1 0 1 1 1 1 1 1 1 0 0 0 1 1 1 0 1 1 0"
      );
      expect(rows[i++]).toBe(
        "0 1 1 0 1 1 1 0 1 1 0 1 1 1 1 1 1 0 1 1 1 1 1 1 0 1 1 1 1 1 1 0 1 1 1 0 1 1 0 1 1 0"
      );
      expect(rows[i++]).toBe(
        "0 1 1 0 0 0 0 0 1 1 0 0 0 0 1 1 1 0 1 1 1 1 1 1 0 1 1 1 1 1 1 0 1 1 1 0 1 1 0 1 1 0"
      );
      expect(rows[i++]).toBe(
        "0 1 1 0 1 1 1 0 1 1 0 1 1 1 1 1 1 0 1 1 1 1 1 1 0 1 1 1 1 1 1 0 1 1 1 0 1 1 1 1 1 0"
      );
      expect(rows[i++]).toBe(
        "0 1 1 0 1 1 1 0 1 1 0 0 0 0 0 1 1 0 0 0 0 0 1 1 0 0 0 0 0 1 1 1 0 0 0 1 1 1 0 1 1 0"
      );
      expect(rows[i++]).toBe(
        "0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0"
      );
      expect(rows[i++]).toBe(
        "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"
      );
    });
  });

  it("raw bitmap", async () => {
    const img = SurfaceStd.create(bWidth, bHeight, 1, {
      colorModel: "Gray",
      data: new Uint8Array(bitmap),
    });
    const fname = "raw-bw.pbm";
    const wstream = await getTestFile(__dirname, fname, "w");
    await savePnm(formatForSaveFromSurface(img), wstream, {
      dataType: "raw",
      mapFormat: "bitmap",
    });
    const size = await wstream.getSize();
    expect(size).not.toBe(0);
    const rstream = await getTestFile(__dirname, fname, "r");
    await streamLock(rstream, async () => {
      const all = await rstream.read(size);
      const eol1 = all.indexOf(0x0a);
      const row1 = bytesToUtf8(all.slice(0, eol1));
      expect(row1).toBe("P4");
      const eol2 = all.indexOf(0x0a, eol1 + 1);
      const row2 = bytesToUtf8(all.slice(eol1 + 1, eol2));
      expect(row2).toBe(`${bWidth} ${bHeight}`);
      const ln0 = eol2 + 1;
      const lnSize = (bWidth + 7) >> 3;
      const invDump = (row: number[]): string =>
        dumpA(row.map((n) => ~n & 0xff));
      expect(dump(all.slice(ln0, ln0 + lnSize))).toBe(
        invDump(bitmap.slice(0, lnSize))
      );
      expect(dump(all.slice(ln0 + lnSize, ln0 + lnSize * 2))).toBe(
        invDump(bitmap.slice(lnSize, lnSize * 2))
      );
    });
  });

  // ----------- graymap 8

  const gCube = SurfaceStd.create(17, 17, 8, { colorModel: "Gray" });
  for (let y = 0; y < 17; y++) {
    const row = gCube.getRowBuffer(y);
    for (let x = 0; x < 17; x++) {
      row[x] = y * 8 + Math.max(0, x * 8 - 1);
    }
  }

  it("raw graymap", async () => {
    const fname = "raw-g8.pgm";
    const wstream = await getTestFile(__dirname, fname, "w");
    await savePnm(formatForSaveFromSurface(gCube), wstream, {
      dataType: "raw",
      mapFormat: "graymap",
    });
    const size = await wstream.getSize();
    expect(size).not.toBe(0);
    const rstream = await getTestFile(__dirname, fname, "r");
    await streamLock(rstream, async () => {
      const all = await rstream.read(size);
      const eol1 = all.indexOf(0x0a);
      const row1 = bytesToUtf8(all.slice(0, eol1));
      expect(row1).toBe("P5");
      const eol2 = all.indexOf(0x0a, eol1 + 1);
      const row2 = bytesToUtf8(all.slice(eol1 + 1, eol2));
      expect(row2).toBe(`17 17`);
      const eol3 = all.indexOf(0x0a, eol2 + 1);
      const row3 = bytesToUtf8(all.slice(eol2 + 1, eol3));
      expect(row3).toBe("255");
      const ln0 = eol3 + 1;
      const lnSize = 17;
      expect(dump(all.slice(ln0, ln0 + lnSize))).toBe(
        dump(gCube.getRowBuffer(0))
      );
      expect(dump(all.slice(ln0 + lnSize, ln0 + lnSize * 2))).toBe(
        dump(gCube.getRowBuffer(1))
      );
    });
  });

  it("plain graymap", async () => {
    const fname = "plain-g8.pgm";
    const wstream = await getTestFile(__dirname, fname, "w");
    await savePnm(formatForSaveFromSurface(gCube), wstream, {
      dataType: "plain",
      mapFormat: "graymap",
    });
    const size = await wstream.getSize();
    expect(size).not.toBe(0);
    const rstream = await getTestFile(__dirname, fname, "r");
    await streamLock(rstream, async () => {
      const all = await rstream.read(size);
      const lines = bytesToUtf8(all).split("\n");
      let i = 0;
      expect(lines[i++]).toBe("P2");
      expect(lines[i++]).toBe("17 17");
      expect(lines[i++]).toBe("255");
      for (let y = 0; y < gCube.height; y++) {
        const row = gCube.getRowBuffer(y);
        expect(lines[i++]).toBe(row.join(" "));
      }
    });
  });

  // --------------- graymap 16

  const gxCube = SurfaceStd.create(gCube.width, gCube.height, 16, {
    colorModel: "Gray",
  });
  for (let y = 0; y < gxCube.height; y++) {
    const src = gCube.getRowBuffer(y);
    const dstBuf = gxCube.getRowBuffer(y);
    const dst = new Uint16Array(dstBuf.buffer, dstBuf.byteOffset);
    for (let x = 0; x < gxCube.width; x++) {
      const v = src[x]!;
      dst[x] = v << 8; // Низ специально не заполнен, чтобы можно было проверить порядок байтов
    }
  }

  it("raw graymap 16", async () => {
    const fname = "raw-g16.pgm";
    const wstream = await getTestFile(__dirname, fname, "w");
    await savePnm(formatForSaveFromSurface(gxCube), wstream, {
      dataType: "raw",
      mapFormat: "graymap",
    });
    const size = await wstream.getSize();
    expect(size).not.toBe(0);
    const rstream = await getTestFile(__dirname, fname, "r");
    await streamLock(rstream, async () => {
      const all = await rstream.read(size);
      const eol1 = all.indexOf(0x0a);
      const row1 = bytesToUtf8(all.slice(0, eol1));
      expect(row1).toBe("P5");
      const eol2 = all.indexOf(0x0a, eol1 + 1);
      const row2 = bytesToUtf8(all.slice(eol1 + 1, eol2));
      expect(row2).toBe(`17 17`);
      const eol3 = all.indexOf(0x0a, eol2 + 1);
      const row3 = bytesToUtf8(all.slice(eol2 + 1, eol3));
      expect(row3).toBe("65535");
      const ln0 = eol3 + 1;
      const lnSize = 17 * 2;
      const rowDump = (y: number) => {
        const src = gxCube.getRowBuffer(y);
        const dst = new Uint8Array(gxCube.width * 2);
        copyWordsToBigEndian(
          gxCube.width,
          src.buffer,
          src.byteOffset,
          dst.buffer,
          dst.byteOffset
        );
        return dump(dst);
      };
      expect(dump(all.slice(ln0, ln0 + lnSize))).toBe(rowDump(0));
      expect(dump(all.slice(ln0 + lnSize, ln0 + lnSize * 2))).toBe(rowDump(1));
    });
  });

  it("plain graymap 16", async () => {
    const wstream = await getTestFile(__dirname, "plain-g16.pgm", "w");
    await savePnm(formatForSaveFromSurface(gxCube), wstream, {
      dataType: "plain",
      mapFormat: "graymap",
      maxRowLength: 120,
    });
    const size = await wstream.getSize();
    const rstream = await getTestFile(__dirname, "plain-g16.pgm", "r");
    await streamLock(rstream, async () => {
      const all = await rstream.read(size);
      const lines = bytesToUtf8(all).split("\n");
      let i = 0;
      expect(lines[i++]).toBe("P2");
      expect(lines[i++]).toBe("17 17");
      expect(lines[i++]).toBe("65535");
      for (let y = 0; y < gxCube.height; y++) {
        const bRow = gxCube.getRowBuffer(y);
        const wRow = new Uint16Array(
          bRow.buffer,
          bRow.byteOffset,
          gxCube.width
        );
        expect(lines[i++]).toBe(wRow.join(" "));
      }
    });
  });

  // ------------------- colormap 8
  const rCube = new SurfaceStd({
    size: gCube.size,
    fmt: new PixelFormat("R8G8B8"),
  });
  for (let y = 0; y < rCube.height; y++) {
    const src = gCube.getRowBuffer(y);
    const dst = rCube.getRowBuffer(y);
    let i = 0;
    for (let x = 0; x < rCube.width; x++) {
      dst[i++] = src[x]!;
      dst[i++] = 0;
      dst[i++] = 0;
    }
  }
  it("plain pixmap", async () => {
    const wstream = await getTestFile(__dirname, "plain-rgb.ppm", "w");
    await savePnm(formatForSaveFromSurface(rCube), wstream, {
      dataType: "plain",
      mapFormat: "pixmap",
      maxRowLength: 160,
    });
    const size = await wstream.getSize();
    const rstream = await getTestFile(__dirname, "plain-rgb.ppm", "r");
    await streamLock(rstream, async () => {
      const all = await rstream.read(size);
      const lines = bytesToUtf8(all).split("\n");
      let i = 0;
      expect(lines[i++]).toBe("P3");
      expect(lines[i++]).toBe("17 17");
      expect(lines[i++]).toBe("255");
      for (let y = 0; y < rCube.height; y++) {
        const row = rCube.getRowBuffer(y);
        expect(lines[i++]).toBe(row.join(" "));
      }
    });
  });

  it("raw pixmap", async () => {
    const fname = "raw-rgb.ppm";
    const wstream = await getTestFile(__dirname, fname, "w");
    await savePnm(formatForSaveFromSurface(rCube), wstream, {
      dataType: "raw",
      mapFormat: "pixmap",
    });
    const size = await wstream.getSize();
    const rstream = await getTestFile(__dirname, fname, "r");
    await streamLock(rstream, async () => {
      const all = await rstream.read(size);
      const eol1 = all.indexOf(0x0a);
      expect(bytesToUtf8(all.slice(0, eol1))).toBe("P6");
      const eol2 = all.indexOf(0x0a, eol1 + 1);
      expect(bytesToUtf8(all.slice(eol1 + 1, eol2))).toBe("17 17");
      const eol3 = all.indexOf(0x0a, eol2 + 1);
      expect(bytesToUtf8(all.slice(eol2 + 1, eol3))).toBe("255");
      for (let y = 0; y < rCube.height; y++) {
        const row = rCube.getRowBuffer(y);
        const pos = eol3 + 1 + y * rCube.rowSize;
        expect(dump(all.slice(pos, pos + rCube.rowSize))).toBe(dump(row));
      }
    });
  });

  // -----------  rgb 16
  const mCube = new SurfaceStd({
    size: gxCube.size,
    fmt: new PixelFormat("R16G16B16"),
  });
  for (let y = 0; y < mCube.height; y++) {
    const bsrc = gxCube.getRowBuffer(y);
    const wsrc = new Uint16Array(bsrc.buffer, bsrc.byteOffset);
    const bdst = mCube.getRowBuffer(y);
    const wdst = new Uint16Array(bdst.buffer, bdst.byteOffset);
    let i = 0;
    for (let x = 0; x < mCube.width; x++) {
      const c = wsrc[x]!;
      wdst[i++] = c;
      wdst[i++] = 0;
      wdst[i++] = c;
    }
  }

  it("plain pixmap 16", async () => {
    const fname = "plain-rgb16.ppm";
    const wstream = await getTestFile(__dirname, fname, "w");
    await savePnm(formatForSaveFromSurface(mCube), wstream, {
      dataType: "plain",
      mapFormat: "pixmap",
    });
    const size = await wstream.getSize();
    const rstream = await getTestFile(__dirname, fname, "r");
    await streamLock(rstream, async () => {
      const all = await rstream.read(size);
      const lines = bytesToUtf8(all).split("\n");
      let i = 0;
      expect(lines[i++]).toBe("P3");
      expect(lines[i++]).toBe("17 17");
      expect(lines[i++]).toBe("65535");
      expect(lines[i++]).toBe(
        "0 0 0 1792 0 1792 3840 0 3840 5888 0 5888 7936 0 7936 9984 0 9984"
      );
      expect(lines[i++]).toBe(
        "12032 0 12032 14080 0 14080 16128 0 16128 18176 0 18176 20224 0 20224"
      );
      expect(lines[i++]).toBe(
        "22272 0 22272 24320 0 24320 26368 0 26368 28416 0 28416 30464 0 30464"
      );
      expect(lines[i++]).toBe("32512 0 32512");
    });
  });

  it("raw pixmap 16", async () => {
    const fname = "raw-rgb16.ppm";
    const wstream = await getTestFile(__dirname, fname, "w");
    await savePnm(formatForSaveFromSurface(mCube), wstream, {
      dataType: "raw",
      mapFormat: "pixmap",
    });
    const size = await wstream.getSize();
    const rstream = await getTestFile(__dirname, fname, "r");
    await streamLock(rstream, async () => {
      const all = await rstream.read(size);
      const eol1 = all.indexOf(0x0a);
      expect(bytesToUtf8(all.slice(0, eol1))).toBe("P6");
      const eol2 = all.indexOf(0x0a, eol1 + 1);
      expect(bytesToUtf8(all.slice(eol1 + 1, eol2))).toBe("17 17");
      const eol3 = all.indexOf(0x0a, eol2 + 1);
      expect(bytesToUtf8(all.slice(eol2 + 1, eol3))).toBe("65535");
      for (let y = 0; y < mCube.height; y++) {
        const row = mCube.getRowBuffer(y);
        const pos = eol3 + 1 + y * mCube.rowSize;
        const wrow = new Uint16Array(mCube.width * 3);
        copyWordsToBigEndian(
          mCube.width * 3,
          row.buffer,
          row.byteOffset,
          wrow.buffer,
          wrow.byteOffset
        );
        const needStr = dumpA(Array.from(wrow));
        const line = all.slice(pos, pos + mCube.rowSize);
        const wline = new Uint16Array(
          line.buffer,
          line.byteOffset,
          mCube.width * 3
        );
        const str = dumpA(Array.from(wline));
        expect(str).toBe(needStr);
      }
    });
  });
});
