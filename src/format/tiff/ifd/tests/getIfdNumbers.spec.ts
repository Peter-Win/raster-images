import { BufferStream } from "../../../../stream";
import { getIfdNumbers, loadIfdEntry } from "../IfdEntry";
import { IfdType } from "../IfdType";

describe("getIfdNumbers", () => {
  it("Byte short", async () => {
    // not use offset
    const srcA = [
      [0, 0],
      [0, IfdType.byte],
      [0, 0, 0, 3], // count = 3
      [1, 2, 3, 0],
    ];
    const littleEndian = false;
    const streamA = new BufferStream(new Uint8Array(srcA.flatMap((n) => n)));
    const ifd = await loadIfdEntry(streamA, littleEndian);
    expect(await getIfdNumbers(ifd, streamA, littleEndian)).toEqual([1, 2, 3]);
  });

  it("Byte long", async () => {
    // not use offset
    const src = [
      [0, 0],
      [IfdType.byte, 0],
      [5, 0, 0, 0], // count = 5
      [12, 0, 0, 0], // 12 = offset of data
      [1, 2, 3, 4, 5],
    ];
    const littleEndian = true;
    const stream = new BufferStream(new Uint8Array(src.flatMap((n) => n)));
    const ifd = await loadIfdEntry(stream, littleEndian);
    expect(await getIfdNumbers(ifd, stream, littleEndian)).toEqual([
      1, 2, 3, 4, 5,
    ]);
  });

  it("short short", async () => {
    const littleEndian = false;
    const src = [
      [0, 0],
      [0, IfdType.short],
      [0, 0, 0, 2], // count=2 => size=4
      [1, 7, 2, 0x34], // 0x107, 0x234
    ];
    const stream = new BufferStream(new Uint8Array(src.flatMap((n) => n)));
    const ifd = await loadIfdEntry(stream, littleEndian);
    expect(await getIfdNumbers(ifd, stream, littleEndian)).toEqual([
      0x107, 0x234,
    ]);
  });

  it("short long", async () => {
    const littleEndian = true;
    const src = [
      [0, 0],
      [IfdType.short, 0],
      [3, 0, 0, 0], // count=3 => size=6
      [12, 0, 0, 0], // offset = size of IFD
      [9, 0, 0xff, 3, 0xcd, 0xab], // 0009, 03FF, ABCD
    ];
    const stream = new BufferStream(new Uint8Array(src.flatMap((n) => n)));
    const ifd = await loadIfdEntry(stream, littleEndian);
    expect(await getIfdNumbers(ifd, stream, littleEndian)).toEqual([
      9, 0x3ff, 0xabcd,
    ]);
  });

  it("long short", async () => {
    const littleEndian = false;
    const src = [
      [0, 0],
      [0, IfdType.long],
      [0, 0, 0, 1], // count=1 => size=4
      [1, 7, 2, 0x34],
    ];
    const stream = new BufferStream(new Uint8Array(src.flatMap((n) => n)));
    const ifd = await loadIfdEntry(stream, littleEndian);
    expect(await getIfdNumbers(ifd, stream, littleEndian)).toEqual([
      0x01070234,
    ]);
  });

  it("long long", async () => {
    const littleEndian = true;
    const src = [
      [0, 0],
      [IfdType.long, 0],
      [3, 0, 0, 0], // count=3 => size=12
      [12, 0, 0, 0], // offset = size of IFD
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // 04030201, 08070605, 0C0B0A09
    ];
    const stream = new BufferStream(new Uint8Array(src.flatMap((n) => n)));
    const ifd = await loadIfdEntry(stream, littleEndian);
    expect(await getIfdNumbers(ifd, stream, littleEndian)).toEqual([
      0x04030201, 0x08070605, 0x0c0b0a09,
    ]);
  });

  it("rational", async () => {
    const littleEndian = false;
    const src = [
      [0, 0],
      [0, IfdType.rational],
      [0, 0, 0, 1], // count=1 => size=8
      [0, 0, 0, 12],
      [0, 0, 0, 1], // the numerator of a fraction
      [0, 0, 0, 2], // the denominator
    ];
    const stream = new BufferStream(new Uint8Array(src.flatMap((n) => n)));
    const ifd = await loadIfdEntry(stream, littleEndian);
    expect(await getIfdNumbers(ifd, stream, littleEndian)).toEqual([0.5]);
  });

  it("sByte", async () => {
    const littleEndian = false;
    const src = [
      [0, 0],
      [0, IfdType.sbyte],
      [0, 0, 0, 3], // count=3 => size=3
      [5, 0, -3, 0],
    ];
    const stream = new BufferStream(new Uint8Array(src.flatMap((n) => n)));
    const ifd = await loadIfdEntry(stream, littleEndian);
    expect(await getIfdNumbers(ifd, stream, littleEndian)).toEqual([5, 0, -3]);
  });

  it("sShort", async () => {
    const littleEndian = false;
    const src = [
      [0, 0],
      [0, IfdType.sshort],
      [0, 0, 0, 3], // count=3 => size=6
      [0, 0, 0, 12],
      [0, 1], // 0001
      [1, 0xfe], // 01FE
      [0xff, 0xfe], // FFFE = -2
    ];
    const stream = new BufferStream(new Uint8Array(src.flatMap((n) => n)));
    const ifd = await loadIfdEntry(stream, littleEndian);
    expect(await getIfdNumbers(ifd, stream, littleEndian)).toEqual([
      1, 0x1fe, -2,
    ]);
  });

  it("sLong", async () => {
    const littleEndian = true;
    const src = [
      [0, 0],
      [IfdType.slong, 0],
      [2, 0, 0, 0], // count=2 => size=8
      [12, 0, 0, 0],
      [1, 0, 0, 0], // 0001
      [0xfe, 0xff, 0xff, 0xff], // FFFFFFFE = -2
    ];
    const stream = new BufferStream(new Uint8Array(src.flatMap((n) => n)));
    const ifd = await loadIfdEntry(stream, littleEndian);
    expect(await getIfdNumbers(ifd, stream, littleEndian)).toEqual([1, -2]);
  });

  it("sRational", async () => {
    const littleEndian = true;
    const src = [
      [0, 0],
      [IfdType.srational, 0],
      [1, 0, 0, 0], // count=1 => size=8
      [12, 0, 0, 0],
      [0xff, 0xff, 0xff, 0xff], // -1
      [4, 0, 0, 0], // 4
    ];
    const stream = new BufferStream(new Uint8Array(src.flatMap((n) => n)));
    const ifd = await loadIfdEntry(stream, littleEndian);
    expect(await getIfdNumbers(ifd, stream, littleEndian)).toEqual([-0.25]);
  });

  it("float short", async () => {
    const littleEndian = true;
    const src = [
      [0, 0],
      [IfdType.float, 0],
      [1, 0, 0, 0], // count=1 => size=4
      [0, 0, 0, 0], // fill below
    ];
    const stream = new BufferStream(new Uint8Array(src.flatMap((n) => n)));
    const dv = new DataView(stream.buffer.buffer, stream.buffer.byteOffset);
    dv.setFloat32(8, -3.125, littleEndian);
    const ifd = await loadIfdEntry(stream, littleEndian);
    expect(await getIfdNumbers(ifd, stream, littleEndian)).toEqual([-3.125]);
  });

  it("double", async () => {
    const littleEndian = false;
    const src = [
      [0, 0],
      [0, IfdType.double],
      [0, 0, 0, 2], // count=2 => size=16
      [0, 0, 0, 12],
      [1, 2, 3, 4, 5, 6, 7, 8], // +12
      [1, 2, 3, 4, 5, 6, 7, 8], // +20
    ];
    const stream = new BufferStream(new Uint8Array(src.flatMap((n) => n)));
    const dv = new DataView(stream.buffer.buffer, stream.buffer.byteOffset);
    dv.setFloat64(12, 5.5, littleEndian);
    dv.setFloat64(20, -3.125, littleEndian);
    const ifd = await loadIfdEntry(stream, littleEndian);
    expect(await getIfdNumbers(ifd, stream, littleEndian)).toEqual([
      5.5, -3.125,
    ]);
  });
});
