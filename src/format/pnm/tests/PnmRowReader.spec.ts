import { BufferStream } from "../../../stream";
import { TextReadStream } from "../../../stream/TextReadStream";
import { dump, dumpA } from "../../../utils";
import {
  pbmRowReaderPlain,
  pbmRowReaderRaw,
  pnmRowReaderGrayPlainByte,
  pnmRowReaderGrayPlainWord,
  pnmRowReaderGrayRawByte,
  pnmRowReaderGrayRawWord,
  pnmRowReaderRgbPlainByte,
  pnmRowReaderRgbPlainWord,
  pnmRowReaderRgbRawByte,
  pnmRowReaderRgbRawWord,
} from "../PnmRowReader";

describe("pnmRowReaderGrayPlainByte", () => {
  it("without scale", async () => {
    const width = 4;
    const stream = new TextReadStream("0 1 2 15   16 17 254 255");
    const read = pnmRowReaderGrayPlainByte(stream, 255);
    const buf = new Uint8Array(width);
    await read(width, buf);
    expect(Array.from(buf)).toEqual([0, 1, 2, 15]);
    await read(width, buf);
    expect(Array.from(buf)).toEqual([16, 17, 254, 255]);
  });
  it("scale by 16", async () => {
    const width = 8;
    const stream = new TextReadStream("15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0");
    const read = pnmRowReaderGrayPlainByte(stream, 15);
    const buf = new Uint8Array(width);
    await read(width, buf);
    expect(Array.from(buf)).toEqual([255, 238, 221, 204, 187, 170, 153, 136]);
    await read(width, buf);
    expect(Array.from(buf)).toEqual([119, 102, 85, 68, 51, 34, 17, 0]);
  });
  it("maxVal=2", async () => {
    // 2 => maxVal,  1 => maxVal/2
    const stream = new TextReadStream("0 1 2");
    const width = 3;
    const read = pnmRowReaderGrayPlainByte(stream, 2);
    const buf = new Uint8Array(width);
    await read(width, buf);
    expect(Array.from(buf)).toEqual([0, 127, 255]);
  });
});

describe("pnmRowReaderGrayPlainWord", () => {
  it("without scale", async () => {
    const stream = new TextReadStream("0 1 2 65534 65535");
    const width = 5;
    const read = pnmRowReaderGrayPlainWord(stream, 0xffff);
    const buf8 = new Uint8Array(width * 2);
    await read(width, buf8);
    const buf16 = new Uint16Array(buf8.buffer, buf8.byteOffset);
    expect(Array.from(buf16)).toEqual([0, 1, 2, 65534, 65535]);
  });

  it("0..999", async () => {
    const stream = new TextReadStream("0 1 2 10 100 500 999");
    const width = 7;
    const read = pnmRowReaderGrayPlainWord(stream, 999);
    const buf8 = new Uint8Array(width * 2);
    await read(width, buf8);
    const buf16 = new Uint16Array(buf8.buffer, buf8.byteOffset);
    expect(Array.from(buf16)).toEqual([0, 65, 131, 656, 6560, 32800, 65535]);
  });
});

describe("pnmRowReaderGrayRawByte", () => {
  it("without scale", async () => {
    const srcBuf = new Uint8Array([1, 5, 0x22, 0x80, 0xc0, 0xff]);
    const stream = new BufferStream(srcBuf);
    const width = srcBuf.length;
    const read = pnmRowReaderGrayRawByte(stream, 255);
    const dstBuf = new Uint8Array(width);
    await read(width, dstBuf);
    expect(dump(dstBuf)).toBe("01 05 22 80 C0 FF");
  });
  it("scale *16", async () => {
    const srcBuf = new Uint8Array([1, 3, 7, 0xa, 0xc, 0xf]);
    const stream = new BufferStream(srcBuf);
    const width = srcBuf.length;
    const read = pnmRowReaderGrayRawByte(stream, 15);
    const dstBuf = new Uint8Array(width);
    await read(width, dstBuf);
    expect(dump(dstBuf)).toBe("11 33 77 AA CC FF");
  });
});

describe("pnmRowReaderGrayRawWord", () => {
  it("without scale", async () => {
    const srcValues = [0, 0x101, 0x1ff, 0xffff];
    const width = srcValues.length;
    const srcByteBuf = new Uint8Array(width * 2);
    const dv = new DataView(srcByteBuf.buffer, srcByteBuf.byteOffset);
    srcValues.forEach((value, i) => dv.setUint16(i * 2, value, false));
    const stream = new BufferStream(srcByteBuf);
    const read = pnmRowReaderGrayRawWord(stream, 0xffff);
    const dstByteBuf = new Uint8Array(width * 2);
    await read(width, dstByteBuf);
    const dstWordBuf = new Uint16Array(
      dstByteBuf.buffer,
      dstByteBuf.byteOffset
    );
    expect(dumpA(Array.from(dstWordBuf))).toBe("00 0101 01FF FFFF");
  });
  it("maxVal = 1000", async () => {
    const srcValues = [0, 1, 100, 250, 500, 750, 1000];
    const width = srcValues.length;
    const srcByteBuf = new Uint8Array(width * 2);
    const dv = new DataView(srcByteBuf.buffer, srcByteBuf.byteOffset);
    srcValues.forEach((value, i) => dv.setUint16(i * 2, value, false));
    const stream = new BufferStream(srcByteBuf);
    const read = pnmRowReaderGrayRawWord(stream, 1000);
    const dstByteBuf = new Uint8Array(width * 2);
    await read(width, dstByteBuf);
    const dstWordBuf = new Uint16Array(
      dstByteBuf.buffer,
      dstByteBuf.byteOffset
    );
    expect(dumpA(Array.from(dstWordBuf))).toBe(
      "00 41 1999 3FFF 7FFF BFFF FFFF"
    );
  });
});

describe("pnmRowReaderRgbPlainByte", () => {
  it("without scale", async () => {
    const width = 2;
    const stream = new TextReadStream("0 127 255 16 32 48");
    const read = pnmRowReaderRgbPlainByte(stream, 255);
    const dstBuf = new Uint8Array(3 * width);
    await read(width, dstBuf);
    expect(dump(dstBuf)).toBe("00 7F FF 10 20 30");
  });
  it("scale by 16", async () => {
    const width = 3;
    const stream = new TextReadStream("15 14 13  10 9 8  2 1 0");
    const read = pnmRowReaderRgbPlainByte(stream, 15);
    const buf = new Uint8Array(width * 3);
    await read(width, buf);
    expect(Array.from(buf)).toEqual([255, 238, 221, 170, 153, 136, 34, 17, 0]);
  });
});

describe("pnmRowReaderRgbPlainWord", () => {
  it("without scale", async () => {
    const width = 2;
    const stream = new TextReadStream("0 32767 65535  16 32 48");
    const read = pnmRowReaderRgbPlainWord(stream, 0xffff);
    const dstBuf = new Uint8Array(3 * 2 * width);
    await read(width, dstBuf);
    const wBuf = new Uint16Array(dstBuf.buffer, dstBuf.byteOffset);
    expect(dumpA(Array.from(wBuf))).toBe("00 7FFF FFFF 10 20 30");
  });
  it("0..999", async () => {
    const stream = new TextReadStream("0 1 2  10 20 30  100 500 999");
    const width = 3;
    const read = pnmRowReaderRgbPlainWord(stream, 999);
    const buf8 = new Uint8Array(width * 2 * 3);
    await read(width, buf8);
    const buf16 = new Uint16Array(buf8.buffer, buf8.byteOffset);
    expect(Array.from(buf16)).toEqual([
      0, 65, 131, 656, 1312, 1968, 6560, 32800, 65535,
    ]);
  });
});

describe("pnmRowReaderRgbRawByte", () => {
  it("without scale", async () => {
    const srcBuf = new Uint8Array([1, 5, 0x22, 0x80, 0xc0, 0xff]);
    const stream = new BufferStream(srcBuf);
    const width = 2;
    const read = pnmRowReaderRgbRawByte(stream, 255);
    const dstBuf = new Uint8Array(width * 3);
    await read(width, dstBuf);
    expect(dump(dstBuf)).toBe("01 05 22 80 C0 FF");
  });
  it("scale *16", async () => {
    const srcBuf = new Uint8Array([1, 3, 7, 0xa, 0xc, 0xf]);
    const stream = new BufferStream(srcBuf);
    const width = 2;
    const read = pnmRowReaderRgbRawByte(stream, 15);
    const dstBuf = new Uint8Array(width * 3);
    await read(width, dstBuf);
    expect(dump(dstBuf)).toBe("11 33 77 AA CC FF");
  });
});

describe("pnmRowReaderRgbRawWord", () => {
  it("without scale", async () => {
    const srcValues = [0, 0x101, 0x1ff, 0x1fff, 0x7fff, 0xffff];
    const width = srcValues.length / 3;
    const srcByteBuf = new Uint8Array(width * 2 * 3);
    const dv = new DataView(srcByteBuf.buffer, srcByteBuf.byteOffset);
    srcValues.forEach((value, i) => dv.setUint16(i * 2, value, false));
    const stream = new BufferStream(srcByteBuf);
    const read = pnmRowReaderRgbRawWord(stream, 0xffff);
    const dstByteBuf = new Uint8Array(width * 2 * 3);
    await read(width, dstByteBuf);
    const dstWordBuf = new Uint16Array(
      dstByteBuf.buffer,
      dstByteBuf.byteOffset
    );
    expect(dumpA(Array.from(dstWordBuf))).toBe("00 0101 01FF 1FFF 7FFF FFFF");
  });
  it("maxVal = 1000", async () => {
    const srcValues = [0, 1, 100, 500, 750, 1000];
    const width = 2;
    const srcByteBuf = new Uint8Array(width * 2 * 3);
    const dv = new DataView(srcByteBuf.buffer, srcByteBuf.byteOffset);
    srcValues.forEach((value, i) => dv.setUint16(i * 2, value, false));
    const stream = new BufferStream(srcByteBuf);
    const read = pnmRowReaderRgbRawWord(stream, 1000);
    const dstByteBuf = new Uint8Array(width * 2 * 3);
    await read(width, dstByteBuf);
    const dstWordBuf = new Uint16Array(
      dstByteBuf.buffer,
      dstByteBuf.byteOffset,
      width * 3
    );
    expect(dumpA(Array.from(dstWordBuf))).toBe("00 41 1999 7FFF BFFF FFFF");
  });
});

describe("pbmRowReaderPlain", () => {
  it("byte aligned", async () => {
    //           1 -> E   2 -> D   3 -> C   4 -> B   5 -> A   6 -> 9   7 -> 8   8 -> 7
    const src =
      "0 0 0 1  0 0 1 0  0 0 1 1  0 1 0 0  0 1 0 1  0 1 1 0  0 1 1 1  1 0 0 0";
    const stream = new TextReadStream(src);
    const read = pbmRowReaderPlain(stream);
    const dstBuf = new Uint8Array(2);
    await read(16, dstBuf);
    expect(dump(dstBuf)).toBe("ED CB");
    await read(16, dstBuf);
    expect(dump(dstBuf)).toBe("A9 87");
  });
  it("not aligned short", async () => {
    // Короткая строка меньше 8 пикселей в ширину. В цикле не происходит ни одного обращения к буферу.
    //          C -> 3    8->4*  A -> 5   7->8   * 1 0 x x -> 0 1 0 0 ==> 8 -> 4
    const src = "1 1 0 0  1 0   1 0 1 0  0 1";
    const stream = new TextReadStream(src);
    const read = pbmRowReaderPlain(stream);
    const dstBuf = new Uint8Array(1);
    await read(6, dstBuf);
    expect(dump(dstBuf)).toBe("34");
    await read(6, dstBuf);
    expect(dump(dstBuf)).toBe("58");
  });
  it("not aligned long", async () => {
    // Строка не кратная 8, но один байт (полный) заполняется в цикле а второй (неполный) после цикла.
    //          C -> 3
    const src =
      "1 1 0 0  1 1 0 0  1   0 0 1 1  0 0 1 1  0  0 0 0 0  1 1 1 1  0";
    const stream = new TextReadStream(src);
    const read = pbmRowReaderPlain(stream);
    const dstBuf = new Uint8Array(2);
    await read(9, dstBuf);
    expect(dump(dstBuf)).toBe("33 00");
    await read(9, dstBuf);
    expect(dump(dstBuf)).toBe("CC 80");
    await read(9, dstBuf);
    expect(dump(dstBuf)).toBe("F0 80");
  });
});

describe("pbmRowReaderRaw", () => {
  it("aligned", async () => {
    const stream = new BufferStream(new Uint8Array([0xf0, 0xe1, 0xd2]));
    const read = pbmRowReaderRaw(stream);
    const dstBuf = new Uint8Array(3);
    await read(24, dstBuf);
    expect(dump(dstBuf)).toBe("0F 1E 2D");
  });
  it("not aligned", async () => {
    const stream = new BufferStream(new Uint8Array([0xf0, 0xe1, 0xd0]));
    const read = pbmRowReaderRaw(stream);
    const dstBuf = new Uint8Array(3);
    await read(21, dstBuf); // not aligned to byte
    expect(dump(dstBuf)).toBe("0F 1E 2F");
  });
});
