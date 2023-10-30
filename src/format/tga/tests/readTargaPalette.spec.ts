import { BufferStream } from "../../../stream";
import { dumpA } from "../../../utils";
import { TargaImageType } from "../TargaHeader";
import { readTargaPalette } from "../targaPalette";

describe("readTargaPalette", () => {
  it("32bit", async () => {
    const buf = new Uint8Array([1, 2, 3, 0xff, 4, 5, 6, 0xff]);
    const colorMapLength = buf.length / 4;
    const stream = new BufferStream(buf);
    const palette = await readTargaPalette(stream, {
      idLength: 0,
      colorMapType: 1,
      imageType: TargaImageType.uncompressedColorMapped,
      colorMapStart: 0,
      colorMapLength,
      colorItemSize: 32, // <-- !
      x0: 0,
      y0: 0,
      width: 321,
      height: 210,
      depth: 8,
      imageDescriptor: 0,
    });
    expect(palette?.length).toBe(colorMapLength);
    expect(dumpA(palette![0]!)).toBe("01 02 03 FF");
    expect(dumpA(palette![1]!)).toBe("04 05 06 FF");
  });

  it("24bit", async () => {
    const buf = new Uint8Array([1, 2, 3, 4, 5, 6]);
    const colorMapLength = buf.length / 3;
    const stream = new BufferStream(buf);
    const palette = await readTargaPalette(stream, {
      idLength: 0,
      colorMapType: 1,
      imageType: TargaImageType.uncompressedColorMapped,
      colorMapStart: 0,
      colorMapLength,
      colorItemSize: 24, // <-- !
      x0: 0,
      y0: 0,
      width: 321,
      height: 210,
      depth: 8,
      imageDescriptor: 0,
    });
    expect(palette?.length).toBe(colorMapLength);
    expect(dumpA(palette![0]!)).toBe("01 02 03 FF");
    expect(dumpA(palette![1]!)).toBe("04 05 06 FF");
  });

  it("16bit", async () => {
    const buf16 = new Uint16Array([
      0b0111110000000000, 0b0000001111100000, 0b0000000000011111,
    ]);
    const colorMapLength = buf16.length;
    const buf = new Uint8Array(buf16.buffer, buf16.byteOffset);
    const stream = new BufferStream(buf);
    const palette = await readTargaPalette(stream, {
      idLength: 0,
      colorMapType: 1,
      imageType: TargaImageType.rleColorMapped,
      colorMapStart: 0,
      colorMapLength,
      colorItemSize: 16, // <-- !
      x0: 0,
      y0: 0,
      width: 321,
      height: 210,
      depth: 8,
      imageDescriptor: 0,
    });
    expect(palette?.length).toBe(colorMapLength);
    expect(dumpA(palette![0]!)).toBe("00 00 FF FF");
    expect(dumpA(palette![1]!)).toBe("00 FF 00 FF");
    expect(dumpA(palette![2]!)).toBe("FF 00 00 FF");
  });
});
