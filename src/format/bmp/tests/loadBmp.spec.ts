import { SurfaceStd } from "../../../Surface";
import { streamFromGallery } from "../../../tests/streamFromGallery";
import { SurfaceReader } from "../../../transfer/SurfaceReader";
import { FormatBmp } from "../FormatBmp";

describe("load Bmp", () => {
  it("BMP OS/2 indexed 8 bits/pixel", async () => {
    const stream = streamFromGallery("I8-os2.bmp");
    const fmt = await FormatBmp.create(stream);
    expect(fmt.frames.length).toBe(1);
    const frame = fmt.frames[0]!;
    expect(frame.type).toBe("image");
    expect(frame.info.size).toEqual({ x: 120, y: 102 });
    expect(frame.info.fmt.signature).toBe("I8");
    expect(frame.info.fmt.palette?.length).toBe(256);
    const palette = frame.info.fmt.palette!;
    expect(palette[0]).toEqual([0, 0, 0, 255]);
    expect(palette[1]).toEqual([255, 255, 255, 255]);
    expect(palette[2]).toEqual([0x7c, 0x7b, 0xf0, 255]);
    expect(frame.info.vars?.format).toBe("OS/2 bitmap");
    expect(frame.info.vars?.compression).toBe("None");
    expect(frame.info.vars?.ext).toBe("bmp");

    const surface = new SurfaceStd(frame.info);
    const reader = new SurfaceReader(surface);
    await frame.read(reader);
    const row0 = surface.getRowBuffer(0);
    expect(palette[row0[0]!]!.slice(0, 3)).toEqual([76, 140, 156]);
    const rowL = surface.getRowBuffer(surface.height - 1);
    expect(palette[rowL[0]!]!.slice(0, 3)).toEqual([28, 28, 28]);
  });
  it("bilevel", async () => {
    const stream = streamFromGallery("bilevel.bmp");
    const fmt = await FormatBmp.create(stream);
    expect(fmt.frames.length).toBe(1);
    const frame = fmt.frames[0]!;
    expect(frame.info.fmt.signature).toBe("I1");
    expect(frame.info.fmt.palette?.length).toBe(2);
    expect(frame.info.vars?.format).toBe("Windows bitmap");
    expect(frame.info.vars?.compression).toBe("None");
    expect(frame.info.vars?.ext).toBe("bmp");
    expect(frame.info.size).toEqual({ x: 141, y: 92 });
    expect(frame.info.fmt.palette).toEqual([
      [0xff, 0x12, 0, 0xff],
      [0, 0xe4, 0xff, 0xff],
    ]);
    const surface = new SurfaceStd(frame.info);
    const reader = new SurfaceReader(surface);
    await frame.read(reader);

    const { width } = surface;
    const getPix = (buf: Uint8Array, x: number): number => {
      const byteOffset = x >> 3;
      return (buf[byteOffset]! >> (7 - (x & 7))) & 1;
    };
    const rowRules: ((x: number) => number)[] = [
      () => 1,
      () => 1,
      (x) => (x < 2 || x > 137 ? 1 : 0),
      // eslint-disable-next-line no-nested-ternary
      (x) => (x < 2 || x > 137 ? 1 : x === 137 ? 0 : x & 1),
    ];
    rowRules.forEach((rule, y) => {
      const row = surface.getRowBuffer(y);
      for (let x = 0; x < width; x++) {
        expect([y, x, getPix(row, x)]).toEqual([y, x, rule(x)]);
      }
    });
  });
  it("X8BB8G8R8-PS", async () => {
    const stream = streamFromGallery("X8BB8G8R8-PS.bmp");
    const fmt = await FormatBmp.create(stream);
    expect(fmt.frames.length).toBe(1);
    const frame = fmt.frames[0]!;
    expect(frame.info.fmt.signature).toBe("X8B8G8R8");
    expect(frame.info.vars?.format).toBe("Windows bitmap");
    expect(frame.info.vars?.compression).toBe("None");
    expect(frame.info.vars?.ext).toBe("bmp");
    expect(frame.info.size).toEqual({ x: 333, y: 127 });

    const surface = new SurfaceStd(frame.info);
    const reader = new SurfaceReader(surface);
    await frame.read(reader);

    const row1 = surface.getRowBuffer(1);
    expect(Array.from(row1).slice(4, 8)).toEqual([0, 216, 118, 111]);
    const row14 = surface.getRowBuffer(14);
    expect(Array.from(row14).slice(25 * 4, 26 * 4)).toEqual([0, 31, 250, 242]);
  });
});
