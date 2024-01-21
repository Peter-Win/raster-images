import { createInfoSign, getImageLineSize } from "../../../../ImageInfo";
import { BufferStream } from "../../../../stream";
import { dump } from "../../../../utils";
import { stripsReader } from "../stripsReader";

describe("stripesReader", () => {
  it("full version", async () => {
    const strips: number[][] = [
      [1, 2, 3, 4, 5, 6, 7, 8],
      [0x10, 0x20, 0x30, 0x40],
    ];
    const info = createInfoSign(4, 3, "G8");
    const rowSize = getImageLineSize(info);
    expect(rowSize).toBe(4);
    const buf = new Uint8Array(strips.flatMap((n) => n));
    const sizes: number[] = strips.map((st) => st.length);
    const offsets: number[] = [];
    let ofs = 0;
    strips.forEach((_, i) => {
      offsets[i] = ofs;
      ofs += sizes[i]!;
    });
    const stream = new BufferStream(buf);
    const onRow = stripsReader({
      offsets,
      sizes,
      stripHandlers: [(src: Uint8Array) => src.map((n) => n + 1)],
      rowHandlers: [
        (src, srcPos, dst) => {
          for (let i = 0; i < 4; i++) {
            // eslint-disable-next-line no-param-reassign
            dst[i] = src[i + srcPos]! | 0x80;
          }
        },
      ],
      stream,
      // bytesPerSample: 1,
      rowSize,
      stripRowSize: rowSize,
      width: info.size.x,
      height: info.size.y,
      rowsPerStrip: info.size.y,
    });
    const row = new Uint8Array(rowSize);
    await onRow(row, 0);
    // total transformation = (src + 1) | 0x80
    expect(dump(row)).toBe("82 83 84 85");
    await onRow(row, 1);
    expect(dump(row)).toBe("86 87 88 89");
    await onRow(row, 2);
    expect(dump(row)).toBe("91 A1 B1 C1");
  });

  it("short", async () => {
    const buf = new Uint8Array([1, 2, 3, 10, 11, 12]);
    const info = createInfoSign(3, 2, "G8");
    const rowSize = getImageLineSize(info);
    expect(rowSize).toBe(3);
    const offsets = [0];
    const sizes = [buf.length];
    const stream = new BufferStream(buf);
    const onRow = stripsReader({
      offsets,
      sizes,
      stripHandlers: [],
      rowHandlers: [],
      stream,
      rowSize,
      stripRowSize: rowSize,
      width: info.size.x,
      height: info.size.y,
      rowsPerStrip: info.size.y,
    });
    const dst = new Uint8Array(rowSize);
    await onRow(dst, 0);
    expect(dump(dst)).toBe("01 02 03");
    await onRow(dst, 1);
    expect(dump(dst)).toBe("0A 0B 0C");
  });
});
