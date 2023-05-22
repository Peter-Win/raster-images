import { FormatForSave, formatForSaveFromSurface } from "../../FormatForSave";
import { saveBmp } from "../saveBmp";
import { BufferStream } from "../../../stream/BufferStream";
import { ColorModel } from "../../../ColorModel";
import { PixelDepth } from "../../../types";
import { SurfaceStd } from "../../../Surface";
import { bmpOs2 } from "../bmpCommon";
import { createGrayPalette, createPalette } from "../../../Palette";
import { getTestFile } from "../../../tests/getTestFile";
import { NodeJSFile, streamLock } from "../../../stream";
import {
  bmpFileHeaderSize,
  bmpSignature,
  readBmpFileHeader,
} from "../BmpFileHeader";
import { readBmpCoreHeader, sizeBmpCoreHeader } from "../BmpCoreHeader";
import { dump } from "../../../utils";
import {
  BmpCompression,
  bmpInfoHeaderSize,
  readBmpInfoHeader,
} from "../BmpInfoHeader";

describe("saveBmp", () => {
  it("invalid frames count", async () => {
    const f: FormatForSave = {
      frames: [],
    };
    const dstStream = new BufferStream(new Uint8Array(100), { size: 0 });
    await expect(() => saveBmp(f, dstStream)).rejects.toThrowError(
      "Can't write BMP file with 0 frames"
    );
  });
  it("invalid color models", async () => {
    const save = async (depth: PixelDepth, colorModel: ColorModel) => {
      const surface = SurfaceStd.create(2, 2, depth, { colorModel });
      const f = formatForSaveFromSurface(surface);
      const dstStream = new BufferStream(new Uint8Array(100), { size: 0 });
      await saveBmp(f, dstStream);
    };
    await expect(() => save(8, "Gray")).rejects.toThrowError(
      "Wrong BMP image color model: Gray"
    );
    await expect(() => save(32, "CMYK")).rejects.toThrowError(
      "Wrong BMP image color model: CMYK"
    );
  });
  it("invalid OS2 depth", async () => {
    const save = async (depth: PixelDepth) => {
      const surface = SurfaceStd.create(2, 2, depth, {
        vars: { format: bmpOs2 },
      });
      const f = formatForSaveFromSurface(surface);
      const dstStream = new BufferStream(new Uint8Array(100), { size: 0 });
      await saveBmp(f, dstStream);
    };
    await expect(() => save(15)).rejects.toThrowError(
      "Unsupported OS/2 bitmap color depth: 15 bit/pixel"
    );
    await expect(() => save(16)).rejects.toThrowError(
      "Unsupported OS/2 bitmap color depth: 16 bit/pixel"
    );
    await expect(() => save(32)).rejects.toThrowError(
      "Unsupported OS/2 bitmap color depth: 32 bit/pixel"
    );
  });
  it("wrong colors in palette", async () => {
    const save = async () => {
      const surface = SurfaceStd.create(2, 2, 4, {
        vars: { format: bmpOs2 },
        palette: createPalette(20),
      });
      const f = formatForSaveFromSurface(surface);
      const dstStream = new BufferStream(new Uint8Array(100), { size: 0 });
      await saveBmp(f, dstStream);
    };
    await expect(() => save()).rejects.toThrowError(
      "The number of colors in the palette (20) exceeds the limit (16)"
    );
  });

  it("OS/2 8 bits/pixel", async () => {
    // Image 8 bit/pix, 16 color. 4x4 gradient from black to white
    const img = SurfaceStd.create(4, 4, 8, {
      palette: createGrayPalette(16),
      vars: { format: bmpOs2 },
    });
    expect(img.data.byteLength).toBe(16);
    const dv = new DataView(img.data.buffer);
    for (let i = 0; i < 16; i++) dv.setInt8(i, i);
    // format
    const sfmt = formatForSaveFromSurface(img);
    const stream = await getTestFile(__dirname, "os2.bmp", "w");
    // save
    await saveBmp(sfmt, stream);
    // test
    const rs = new NodeJSFile(stream.name, "r");
    await streamLock(rs, async () => {
      await rs.seek(0);
      // bmp file header
      const hdrBuf = await rs.read(bmpFileHeaderSize);
      const hdr = readBmpFileHeader(hdrBuf.buffer, hdrBuf.byteOffset);
      expect(hdr.bfType).toBe(bmpSignature);
      const offset = bmpFileHeaderSize + sizeBmpCoreHeader + 3 * 256;
      expect(hdr.bfOffBits).toBe(offset);
      expect(hdr.bfSize).toBe(offset + 16);
      // bmp core header
      const coreBuf = await rs.read(sizeBmpCoreHeader);
      const bc = readBmpCoreHeader(coreBuf.buffer, coreBuf.byteOffset);
      expect(bc.bcSize).toBe(sizeBmpCoreHeader);
      expect(bc.bcWidth).toBe(4);
      expect(bc.bcHeight).toBe(4);
      expect(bc.bcPlanes).toBe(1);
      expect(bc.bcBitCount).toBe(8);
      // palette
      const pal = await rs.read(256 * 3);
      expect(dump(pal.slice(0, 3 * 16))).toBe(
        "00 00 00 11 11 11 22 22 22 33 33 33 44 44 44 55 55 55 66 66 66 77 77 77 88 88 88 99 99 99 AA AA AA BB BB BB CC CC CC DD DD DD EE EE EE FF FF FF"
      );
      // pixels
      const pixels = await rs.read(16);
      expect(dump(pixels)).toBe(
        "0C 0D 0E 0F 08 09 0A 0B 04 05 06 07 00 01 02 03"
      );
    });
  });

  it("1 bit/pix", async () => {
    const img = SurfaceStd.create(15, 15, 1, {
      palette: [
        [0, 0, 254, 255],
        [254, 254, 254, 255],
      ],
    });
    const setPix = (x: number, y: number) => {
      const offset = img.getRowOffset(y) + (x >> 3);
      const mask = 0x80 >> (x & 7);
      img.data[offset] |= mask;
    };
    const bar = (x: number, y: number) => {
      for (let j = 0; j < 5; j++) {
        for (let i = 0; i < 5; i++) {
          setPix(x + i, y + j);
        }
      }
    };
    bar(0, 0);
    bar(10, 0);
    bar(5, 5);
    bar(0, 10);
    bar(10, 10);
    // format
    const sfmt = formatForSaveFromSurface(img);
    const stream = await getTestFile(__dirname, "bilevel.bmp", "w");
    // save
    await saveBmp(sfmt, stream);

    const rs = new NodeJSFile(stream.name, "r");
    await streamLock(rs, async () => {
      // bmp file header
      const hdrBuf = await rs.read(bmpFileHeaderSize);
      const hdr = readBmpFileHeader(hdrBuf.buffer, hdrBuf.byteOffset);
      expect(hdr.bfType).toBe(bmpSignature);
      const offset = bmpFileHeaderSize + bmpInfoHeaderSize + 4 * 2;
      expect(hdr.bfOffBits).toBe(offset);
      expect(hdr.bfSize).toBe(offset + 4 * 15);
      // bmp info header
      const biBuf = await rs.read(bmpInfoHeaderSize);
      const bi = readBmpInfoHeader(biBuf.buffer, biBuf.byteOffset);
      expect(bi.biSize).toBe(bmpInfoHeaderSize);
      expect(bi.biWidth).toBe(15);
      expect(bi.biHeight).toBe(15);
      expect(bi.biPlanes).toBe(1);
      expect(bi.biBitCount).toBe(1);
      expect(bi.biCompression).toBe(0);
      expect(bi.biSizeImage).toBe(0);
      expect(bi.biXPelsPerMeter).toBe(0);
      expect(bi.biYPelsPerMeter).toBe(0);
      expect(bi.biClrUsed).toBe(2);
      expect(bi.biClrImportant).toBe(0);
      // palette
      const pal = await rs.read(8);
      expect(dump(pal)).toBe("00 00 FE FF FE FE FE FF");
      // pixels
      expect(dump(await rs.read(4 * 5))).toBe(
        "F8 3E 00 00 F8 3E 00 00 F8 3E 00 00 F8 3E 00 00 F8 3E 00 00"
      );
      expect(dump(await rs.read(4 * 5))).toBe(
        "07 C0 00 00 07 C0 00 00 07 C0 00 00 07 C0 00 00 07 C0 00 00"
      );
      expect(dump(await rs.read(4 * 5))).toBe(
        "F8 3E 00 00 F8 3E 00 00 F8 3E 00 00 F8 3E 00 00 F8 3E 00 00"
      );
    });
  });

  it("4 bits/pixel", async () => {
    const img = SurfaceStd.create(21, 9, 4, {
      palette: [
        [0, 0, 0, 255], // 0: black
        [254, 1, 1, 255], // 1: blue
        [2, 254, 2, 255], // 2: green
        [3, 3, 254, 255], // 3: red
        [254, 254, 254, 255], // 4: white
      ],
    });
    const picture = `
444444444444444444444
4                   4
4  333    222  111  4
4  3  3  2     1  1 4
4  333   2 22  111  4
4  3 3   2  2  1  1 4
4  3  3   222  111  4
4                   4
444444444444444444444`;
    const lines = picture.trim().split("\n");
    lines.forEach((line, y) => {
      Array.from(line).forEach((c, x) => {
        const offset = img.getRowOffset(y) + (x >> 1);
        const mask = (+c || 0) << (4 * (1 - (x & 1)));
        img.data[offset] |= mask;
      });
    });
    // format
    const sfmt = formatForSaveFromSurface(img);
    const stream = await getTestFile(__dirname, "4bpp.bmp", "w");
    // save
    await saveBmp(sfmt, stream);
    const rs = new NodeJSFile(stream.name, "r");
    await streamLock(rs, async () => {
      // bmp file header
      const hdrBuf = await rs.read(bmpFileHeaderSize);
      const hdr = readBmpFileHeader(hdrBuf.buffer, hdrBuf.byteOffset);
      expect(hdr.bfType).toBe(bmpSignature);
      const offset = bmpFileHeaderSize + bmpInfoHeaderSize + 5 * 4;
      expect(hdr.bfOffBits).toBe(offset);
      expect(hdr.bfSize).toBe(offset + 12 * 9); // 21 / 2 = 11, align to 4 => 12
      // bmp info header
      const biBuf = await rs.read(bmpInfoHeaderSize);
      const bi = readBmpInfoHeader(biBuf.buffer, biBuf.byteOffset);
      expect(bi.biSize).toBe(bmpInfoHeaderSize);
      expect(bi.biWidth).toBe(21);
      expect(bi.biHeight).toBe(9);
      expect(bi.biPlanes).toBe(1);
      expect(bi.biBitCount).toBe(4);
      expect(bi.biCompression).toBe(0);
      expect(bi.biSizeImage).toBe(0);
      expect(bi.biXPelsPerMeter).toBe(0);
      expect(bi.biYPelsPerMeter).toBe(0);
      expect(bi.biClrUsed).toBe(5);
      expect(bi.biClrImportant).toBe(0);
      // palette
      const pal = await rs.read(4 * 5);
      expect(dump(pal)).toBe(
        "00 00 00 FF FE 01 01 FF 02 FE 02 FF 03 03 FE FF FE FE FE FF"
      );
      // pixels
      expect(dump(await rs.read(12))).toBe(
        "44 44 44 44 44 44 44 44 44 44 40 00"
      );
      expect(dump(await rs.read(12))).toBe(
        "40 00 00 00 00 00 00 00 00 00 40 00"
      );
      expect(dump(await rs.read(12))).toBe(
        "40 03 00 30 00 22 20 01 11 00 40 00"
      );
      expect(dump(await rs.read(12))).toBe(
        "40 03 03 00 02 00 20 01 00 10 40 00"
      );
      expect(dump(await rs.read(12))).toBe(
        "40 03 33 00 02 02 20 01 11 00 40 00"
      );
      expect(dump(await rs.read(12))).toBe(
        "40 03 00 30 02 00 00 01 00 10 40 00"
      );
      expect(dump(await rs.read(12))).toBe(
        "40 03 33 00 00 22 20 01 11 00 40 00"
      );
      expect(dump(await rs.read(12))).toBe(
        "40 00 00 00 00 00 00 00 00 00 40 00"
      );
      expect(dump(await rs.read(12))).toBe(
        "44 44 44 44 44 44 44 44 44 44 40 00"
      );
    });
  });

  it("8 bits/pixel", async () => {
    const palette = createPalette(18);
    palette[0] = [0, 0, 0, 255]; // 0: black
    palette[1] = [255, 255, 255, 255]; // 1: white
    for (let i = 0; i < 16; i++) palette[2 + i] = [i * 16, i * 8, 0, 255];

    const img = SurfaceStd.create(10, 10, 8, {
      palette,
      vars: {
        importantColors: 2,
        resX: 72,
        resY: 72,
        resUnit: "inch",
      },
    });
    img.getRowBuffer(0).fill(1);
    img.getRowBuffer(9).fill(1);
    for (let y = 1; y < 9; y++) {
      const buf = img.getRowBuffer(y);
      buf[0] = 1;
      buf[9] = 1;
      for (let x = 0; x < 8; x++) buf[x + 1] = x + y + 1;
    }
    // format
    const sfmt = formatForSaveFromSurface(img);
    const stream = await getTestFile(__dirname, "8bpp.bmp", "w");
    // save
    await saveBmp(sfmt, stream);

    await streamLock(new NodeJSFile(stream.name, "r"), async (rs) => {
      // bmp file header
      const hdrBuf = await rs.read(bmpFileHeaderSize);
      const hdr = readBmpFileHeader(hdrBuf.buffer, hdrBuf.byteOffset);
      expect(hdr.bfType).toBe(bmpSignature);
      const offset = bmpFileHeaderSize + bmpInfoHeaderSize + palette.length * 4;
      expect(hdr.bfOffBits).toBe(offset);
      expect(hdr.bfSize).toBe(offset + 12 * 10); // 10 align to 4 => 12
      // bmp info header
      const biBuf = await rs.read(bmpInfoHeaderSize);
      const bi = readBmpInfoHeader(biBuf.buffer, biBuf.byteOffset);
      expect(bi.biSize).toBe(bmpInfoHeaderSize);
      expect(bi.biWidth).toBe(10);
      expect(bi.biHeight).toBe(10);
      expect(bi.biPlanes).toBe(1);
      expect(bi.biBitCount).toBe(8);
      expect(bi.biCompression).toBe(0);
      expect(bi.biSizeImage).toBe(0);
      expect(bi.biXPelsPerMeter).toBe(2835);
      expect(bi.biYPelsPerMeter).toBe(2835);
      expect(bi.biClrUsed).toBe(18);
      expect(bi.biClrImportant).toBe(2);
      // palette
      expect(dump(await rs.read(4 * 6))).toBe(
        "00 00 00 FF FF FF FF FF 00 00 00 FF 10 08 00 FF 20 10 00 FF 30 18 00 FF"
      );
      expect(dump(await rs.read(4 * 6))).toBe(
        "40 20 00 FF 50 28 00 FF 60 30 00 FF 70 38 00 FF 80 40 00 FF 90 48 00 FF"
      );
      expect(dump(await rs.read(4 * 6))).toBe(
        "A0 50 00 FF B0 58 00 FF C0 60 00 FF D0 68 00 FF E0 70 00 FF F0 78 00 FF"
      );
      // pixels, 12 = 10 aligned to 4
      expect(dump(await rs.read(12))).toBe(
        "01 01 01 01 01 01 01 01 01 01 00 00"
      ); // 9
      expect(dump(await rs.read(12))).toBe(
        "01 09 0A 0B 0C 0D 0E 0F 10 01 00 00"
      ); // 8
      expect(dump(await rs.read(12))).toBe(
        "01 08 09 0A 0B 0C 0D 0E 0F 01 00 00"
      ); // 7
      expect(dump(await rs.read(12))).toBe(
        "01 07 08 09 0A 0B 0C 0D 0E 01 00 00"
      ); // 6
      expect(dump(await rs.read(12))).toBe(
        "01 06 07 08 09 0A 0B 0C 0D 01 00 00"
      ); // 5
      expect(dump(await rs.read(12))).toBe(
        "01 05 06 07 08 09 0A 0B 0C 01 00 00"
      ); // 4
      expect(dump(await rs.read(12))).toBe(
        "01 04 05 06 07 08 09 0A 0B 01 00 00"
      ); // 3
      expect(dump(await rs.read(12))).toBe(
        "01 03 04 05 06 07 08 09 0A 01 00 00"
      ); // 2
      expect(dump(await rs.read(12))).toBe(
        "01 02 03 04 05 06 07 08 09 01 00 00"
      ); // 1
      expect(dump(await rs.read(12))).toBe(
        "01 01 01 01 01 01 01 01 01 01 00 00"
      ); // 0
    });
  });

  it("15 bits/pixel", async () => {
    const img = SurfaceStd.create(18, 8, 15, {
      vars: { resX: 72, resY: 72, resUnit: "inch" },
    });
    const dvImg = img.createDataView();
    const dash = (pos0: number, b: number, g: number, r: number): number => {
      let pos = pos0;
      const w = b | (g << 5) | (r << 10);
      for (let i = 0; i < 3; i++) {
        dvImg.setUint16(pos, w, true);
        pos += 2;
      }
      return pos;
    };
    for (let y = 0; y < 8; y++) {
      const h = (y + 1) * 4 - 1; // 03, 07, 0B, 0F,  13, 17, 1B, 1F
      let pos = img.getRowOffset(y);
      pos = dash(pos, h, 0, 0); // blue
      pos = dash(pos, h, h, 0); // cyan
      pos = dash(pos, 0, h, 0); // green
      pos = dash(pos, 0, h, h); // yellow
      pos = dash(pos, 0, 0, h); // red
      pos = dash(pos, h, 0, h); // magenta
    }
    const sfmt = formatForSaveFromSurface(img);
    const stream = await getTestFile(__dirname, "15bpp.bmp", "w");
    await saveBmp(sfmt, stream);

    await streamLock(new NodeJSFile(stream.name, "r"), async (rs) => {
      // bmp file header
      const hdrBuf = await rs.read(bmpFileHeaderSize);
      const hdr = readBmpFileHeader(hdrBuf.buffer, hdrBuf.byteOffset);
      expect(hdr.bfType).toBe(bmpSignature);
      const offset = bmpFileHeaderSize + bmpInfoHeaderSize;
      expect(hdr.bfOffBits).toBe(offset);
      expect(hdr.bfSize).toBe(offset + 36 * 8); // 18 * 2 bytes/pixel = 36
      // bmp info header
      const biBuf = await rs.read(bmpInfoHeaderSize);
      const bi = readBmpInfoHeader(biBuf.buffer, biBuf.byteOffset);
      expect(bi.biSize).toBe(bmpInfoHeaderSize);
      expect(bi.biWidth).toBe(18);
      expect(bi.biHeight).toBe(8);
      expect(bi.biPlanes).toBe(1);
      expect(bi.biBitCount).toBe(16);
      // For 16-bpp bitmaps, if biCompression equals BI_RGB, the format is always RGB 555
      expect(bi.biCompression).toBe(BmpCompression.RGB);
      expect(bi.biSizeImage).toBe(0);
      expect(bi.biXPelsPerMeter).toBe(2835);
      expect(bi.biYPelsPerMeter).toBe(2835);
      // pixels
      const row = new Uint8Array(36);
      const dvRow = new DataView(row.buffer);
      for (let y = 7; y >= 0; y--) {
        await rs.readBuffer(row, 36);
        const h = (y + 1) * 4 - 1; // 03, 07, 0B, 0F,  13, 17, 1B, 1F
        [0b001, 0b011, 0b010, 0b110, 0b100, 0b101].forEach((mask, i) => {
          const x = i * 3;
          const col =
            ((mask & 1) * h) |
            ((((mask >> 1) & 1) * h) << 5) |
            ((((mask >> 2) & 1) * h) << 10);
          expect([y, x, dvRow.getUint16(x * 2, true).toString(16)]).toEqual([
            y,
            x,
            col.toString(16),
          ]);
        });
      }
    });
  });

  it("16 bits/pixel", async () => {
    const img = SurfaceStd.create(18, 8, 16, {
      vars: { rowOrder: "UpToDown" }, // use negative height in info header
    });
    const dvImg = img.createDataView();
    // all samples from 0 to 31. green sample scaled automatically
    const mkColor = (b: number, g: number, r: number): number =>
      b | (((g << 1) | (g & 1)) << 5) | (r << 11);
    const dash = (pos0: number, b: number, g: number, r: number): number => {
      let pos = pos0;
      for (let i = 0; i < 3; i++) {
        dvImg.setUint16(pos, mkColor(b, g, r), true);
        pos += 2;
      }
      return pos;
    };
    for (let y = 0; y < 8; y++) {
      const h = (y + 1) * 4 - 1; // 03, 07, 0B, 0F,  13, 17, 1B, 1F
      let pos = img.getRowOffset(y);
      pos = dash(pos, h, 0, 0); // blue
      pos = dash(pos, h, h, 0); // cyan
      pos = dash(pos, 0, h, 0); // green
      pos = dash(pos, 0, h, h); // yellow
      pos = dash(pos, 0, 0, h); // red
      pos = dash(pos, h, 0, h); // magenta
    }
    const sfmt = formatForSaveFromSurface(img);
    const stream = await getTestFile(__dirname, "16bpp.bmp", "w");
    await saveBmp(sfmt, stream);

    await streamLock(new NodeJSFile(stream.name, "r"), async (rs) => {
      // bmp file header
      const hdrBuf = await rs.read(bmpFileHeaderSize);
      const hdr = readBmpFileHeader(hdrBuf.buffer, hdrBuf.byteOffset);
      expect(hdr.bfType).toBe(bmpSignature);
      const offset = bmpFileHeaderSize + bmpInfoHeaderSize + 12;
      expect(hdr.bfOffBits).toBe(offset);
      expect(hdr.bfSize).toBe(offset + 36 * 8); // 18 * 2 bytes/pixel = 36
      // bmp info header
      const biBuf = await rs.read(bmpInfoHeaderSize);
      const bi = readBmpInfoHeader(biBuf.buffer, biBuf.byteOffset);
      expect(bi.biSize).toBe(bmpInfoHeaderSize);
      expect(bi.biWidth).toBe(18);
      expect(bi.biHeight).toBe(-8);
      expect(bi.biPlanes).toBe(1);
      expect(bi.biBitCount).toBe(16);
      expect(bi.biCompression).toBe(BmpCompression.BITFIELDS);
      expect(bi.biSizeImage).toBe(0);
      // bit fields
      const bfDv = new DataView((await rs.read(12)).buffer);
      expect(bfDv.getUint32(0, true)).toBe(0x1f << 11);
      expect(bfDv.getUint32(4, true)).toBe(0x3f << 5);
      expect(bfDv.getUint32(8, true)).toBe(0x1f);
      // pixels
      const row = new Uint8Array(36);
      const dvRow = new DataView(row.buffer);
      for (let y = 0; y < 8; y++) {
        await rs.readBuffer(row, 36);
        const h = (y + 1) * 4 - 1; // 03, 07, 0B, 0F,  13, 17, 1B, 1F
        [0b001, 0b011, 0b010, 0b110, 0b100, 0b101].forEach((mask, i) => {
          const x = i * 3;
          const col = mkColor(
            (mask & 1) * h,
            ((mask >> 1) & 1) * h,
            ((mask >> 2) & 1) * h
          );
          expect([y, x, dvRow.getUint16(x * 2, true).toString(16)]).toEqual([
            y,
            x,
            col.toString(16),
          ]);
        });
      }
    });
  });

  it("24 bits/pixel", async () => {
    const data = new Uint8Array(5 * 4 * 3);
    let pos = 0;
    const pix = ([c0, c1, c2]: [number, number, number], count: number) => {
      for (let i = 0; i < count; i++) {
        data[pos++] = c0;
        data[pos++] = c1;
        data[pos++] = c2;
      }
    };
    pix([1, 1, 254], 4);
    pix([253, 253, 253], 1);
    pix([2, 254, 2], 3);
    pix([252, 252, 252], 2);
    pix([254, 3, 3], 2);
    pix([251, 251, 251], 3);
    pix([254, 4, 254], 1);
    pix([250, 250, 250], 4);
    const img = SurfaceStd.create(5, 4, 24, { data });
    const sfmt = formatForSaveFromSurface(img);
    const stream = await getTestFile(__dirname, "24bpp.bmp", "w");
    await saveBmp(sfmt, stream);

    await streamLock(new NodeJSFile(stream.name, "r"), async (rs) => {
      // bmp file header
      const hdrBuf = await rs.read(bmpFileHeaderSize);
      const hdr = readBmpFileHeader(hdrBuf.buffer, hdrBuf.byteOffset);
      expect(hdr.bfType).toBe(bmpSignature);
      const offset = bmpFileHeaderSize + bmpInfoHeaderSize;
      expect(hdr.bfOffBits).toBe(offset);
      expect(hdr.bfSize).toBe(offset + 16 * 4); // 15 align => 16
      // bmp info header
      const biBuf = await rs.read(bmpInfoHeaderSize);
      const bi = readBmpInfoHeader(biBuf.buffer, biBuf.byteOffset);
      expect(bi.biSize).toBe(bmpInfoHeaderSize);
      expect(bi.biWidth).toBe(5);
      expect(bi.biHeight).toBe(4);
      expect(bi.biPlanes).toBe(1);
      expect(bi.biBitCount).toBe(24);
      expect(bi.biCompression).toBe(BmpCompression.RGB);
      expect(bi.biSizeImage).toBe(0);
      expect(dump(await rs.read(16))).toBe(
        "FE 04 FE FA FA FA FA FA FA FA FA FA FA FA FA 00"
      );
      expect(dump(await rs.read(16))).toBe(
        "FE 03 03 FE 03 03 FB FB FB FB FB FB FB FB FB 00"
      );
      expect(dump(await rs.read(16))).toBe(
        "02 FE 02 02 FE 02 02 FE 02 FC FC FC FC FC FC 00"
      );
      expect(dump(await rs.read(16))).toBe(
        "01 01 FE 01 01 FE 01 01 FE 01 01 FE FD FD FD 00"
      );
    });
  });

  it("32 bits/pixel", async () => {
    const data = new Uint8Array(5 * 5 * 4);
    let pos = 0;
    const pix = (
      [c0, c1, c2, c3]: [number, number, number, number],
      count: number = 1
    ) => {
      for (let i = 0; i < count; i++) {
        data[pos++] = c0;
        data[pos++] = c1;
        data[pos++] = c2;
        data[pos++] = c3;
      }
    };
    // colors: c0f5ff, 80eaff, 00d6ff
    pix([0, 0, 0, 0]);
    pix([255, 255, 255, 32]);
    pix([255, 255, 255, 255]);
    pix([255, 255, 255, 32]);
    pix([0, 0, 0, 0]);
    pix([255, 255, 255, 32]);
    pix([255, 255, 255, 255], 2);
    pix([255, 245, 192, 255]);
    pix([255, 245, 192, 32]);
    pix([255, 255, 255, 255], 3);
    pix([255, 245, 192, 255], 2);
    pix([255, 234, 128, 32]);
    pix([255, 234, 128, 255], 2);
    pix([255, 214, 0, 255]);
    pix([255, 214, 0, 32]);
    pix([0, 0, 0, 0]);
    pix([255, 234, 128, 32]);
    pix([255, 234, 128, 255]);
    pix([255, 234, 128, 32]);
    pix([0, 0, 0, 0]);

    const img = SurfaceStd.create(5, 5, 32, { data });
    const sfmt = formatForSaveFromSurface(img);
    const stream = await getTestFile(__dirname, "32bpp.bmp", "w");
    await saveBmp(sfmt, stream);

    await streamLock(new NodeJSFile(stream.name, "r"), async (rs) => {
      // bmp file header
      const hdrBuf = await rs.read(bmpFileHeaderSize);
      const hdr = readBmpFileHeader(hdrBuf.buffer, hdrBuf.byteOffset);
      expect(hdr.bfType).toBe(bmpSignature);
      const offset = bmpFileHeaderSize + bmpInfoHeaderSize + 3 * 4;
      expect(hdr.bfOffBits).toBe(offset);
      expect(hdr.bfSize).toBe(offset + 20 * 5);
      // bmp info header
      const biBuf = await rs.read(bmpInfoHeaderSize);
      const bi = readBmpInfoHeader(biBuf.buffer, biBuf.byteOffset);
      expect(bi.biSize).toBe(bmpInfoHeaderSize);
      expect(bi.biWidth).toBe(5);
      expect(bi.biHeight).toBe(5);
      expect(bi.biPlanes).toBe(1);
      expect(bi.biBitCount).toBe(32);
      expect(bi.biCompression).toBe(BmpCompression.BITFIELDS);
      expect(bi.biSizeImage).toBe(0);

      // bit fields
      const bfDv = new DataView((await rs.read(12)).buffer);
      expect(bfDv.getUint32(0, true)).toBe(0xff0000);
      expect(bfDv.getUint32(4, true)).toBe(0xff00);
      expect(bfDv.getUint32(8, true)).toBe(0xff);

      // colors: c0f5ff, 80eaff, 00d6ff
      expect(dump(await rs.read(20))).toBe(
        "00 00 00 00 FF EA 80 20 FF EA 80 FF FF EA 80 20 00 00 00 00"
      );
      expect(dump(await rs.read(20))).toBe(
        "FF EA 80 20 FF EA 80 FF FF EA 80 FF FF D6 00 FF FF D6 00 20"
      );
      expect(dump(await rs.read(20))).toBe(
        "FF FF FF FF FF FF FF FF FF FF FF FF FF F5 C0 FF FF F5 C0 FF"
      );
      expect(dump(await rs.read(20))).toBe(
        "FF FF FF 20 FF FF FF FF FF FF FF FF FF F5 C0 FF FF F5 C0 20"
      );
      expect(dump(await rs.read(20))).toBe(
        "00 00 00 00 FF FF FF 20 FF FF FF FF FF FF FF 20 00 00 00 00"
      );
    });
  });
});
