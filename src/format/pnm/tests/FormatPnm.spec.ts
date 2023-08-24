import { SurfaceStd } from "../../../Surface";
import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { SurfaceReader } from "../../../transfer/SurfaceReader";
import { dump } from "../../../utils";
import { FormatPnm } from "../FormatPnm";

describe("FormatPnm", () => {
  it("plain.pgm", async () => {
    await onStreamFromGallery("plain.pgm", async (stream) => {
      const fmt = await FormatPnm.create(stream);
      expect(fmt.frames.length).toBe(1);
      const frame = fmt.frames[0]!;
      expect(frame.type).toBe("image");
      expect(frame.info.size.toString()).toBe("(24, 7)");
      expect(frame.info.fmt.signature).toBe("G8");
      expect(frame.info.vars?.ext).toBe("pgm");
      expect(frame.info.vars?.ext).toBe("pgm");
      expect(frame.info.vars?.mapType).toBe("graymap");
      expect(frame.info.vars?.dataType).toBe("plain");
      expect(frame.info.vars?.maxVal).toBe(15);

      const surface = new SurfaceStd(frame.info);
      const reader = new SurfaceReader(surface);
      await frame.read(reader);

      const row1 = surface.getRowBuffer(1);
      expect(dump(row1)).toBe(
        "00 33 33 33 33 00 00 77 77 77 77 00 00 BB BB BB BB 00 00 FF FF FF FF 00"
      );
    });
  });

  it("binary.pgm", async () => {
    await onStreamFromGallery("binary.pgm", async (stream) => {
      const fmt = await FormatPnm.create(stream);
      expect(fmt.frames.length).toBe(1);
      const frame = fmt.frames[0]!;
      expect(frame.type).toBe("image");
      expect(frame.info.size.toString()).toBe("(24, 7)");
      expect(frame.info.fmt.signature).toBe("G8");
      expect(frame.info.vars?.ext).toBe("pgm");
      expect(frame.info.vars?.mapType).toBe("graymap");
      expect(frame.info.vars?.dataType).toBe("raw");
      expect(frame.info.vars?.maxVal).toBe(255);

      const surface = new SurfaceStd(frame.info);
      const reader = new SurfaceReader(surface);
      await frame.read(reader);

      const row1 = surface.getRowBuffer(1);
      expect(dump(row1)).toBe(
        "00 33 33 33 33 00 00 77 77 77 77 00 00 BB BB BB BB 00 00 FF FF FF FF 00"
      );
    });
  });

  it("plain16.pgm", async () => {
    await onStreamFromGallery("plain16.pgm", async (stream) => {
      const fmt = await FormatPnm.create(stream);
      expect(fmt.frames.length).toBe(1);
      const frame = fmt.frames[0]!;
      expect(frame.type).toBe("image");
      expect(frame.info.size.toString()).toBe("(4, 4)");
      expect(frame.info.fmt.signature).toBe("G16");
      expect(frame.info.vars?.ext).toBe("pgm");
      expect(frame.info.vars?.mapType).toBe("graymap");
      expect(frame.info.vars?.dataType).toBe("plain");
      expect(frame.info.vars?.maxVal).toBe(0xffff);

      const surface = new SurfaceStd(frame.info);
      const reader = new SurfaceReader(surface);
      await frame.read(reader);

      const row1 = surface.getRowBuffer(1);
      const row1u = new Uint16Array(row1.buffer, row1.byteOffset, 4);
      expect(Array.from(row1u)).toEqual([13777, 24170, 34567, 41349]);
    });
  });

  it("bin16.pgm", async () => {
    await onStreamFromGallery("bin16.pgm", async (stream) => {
      const fmt = await FormatPnm.create(stream);
      expect(fmt.frames.length).toBe(1);
      const frame = fmt.frames[0]!;
      expect(frame.type).toBe("image");
      expect(frame.info.size.toString()).toBe("(4, 4)");
      expect(frame.info.fmt.signature).toBe("G16");
      expect(frame.info.vars?.ext).toBe("pgm");
      expect(frame.info.vars?.mapType).toBe("graymap");
      expect(frame.info.vars?.dataType).toBe("raw");
      expect(frame.info.vars?.maxVal).toBe(0xffff);

      const surface = new SurfaceStd(frame.info);
      const reader = new SurfaceReader(surface);
      await frame.read(reader);

      const row1 = surface.getRowBuffer(1);
      const row1u = new Uint16Array(row1.buffer, row1.byteOffset, 4);
      expect(Array.from(row1u)).toEqual([13777, 24170, 34567, 41349]);
    });
  });

  it("testLF.pgm", async () => {
    // Заголовок отделяется от данных ОДНИМ разделительным символом
    // Здесь специально подобраны данные, которые совпадают по значению с символом LF
    await onStreamFromGallery("testLF.pgm", async (stream) => {
      const fmt = await FormatPnm.create(stream);
      expect(fmt.frames.length).toBe(1);
      const frame = fmt.frames[0]!;
      expect(frame.type).toBe("image");
      expect(frame.info.size.toString()).toBe("(3, 2)");
      expect(frame.info.fmt.signature).toBe("G8");
      expect(frame.info.vars?.ext).toBe("pgm");
      expect(frame.info.vars?.mapType).toBe("graymap");
      expect(frame.info.vars?.dataType).toBe("raw");
      expect(frame.info.vars?.maxVal).toBe(255);

      const surface = new SurfaceStd(frame.info);
      const reader = new SurfaceReader(surface);
      await frame.read(reader);

      expect(dump(surface.getRowBuffer(0))).toBe("0A 0A 0A");
      expect(dump(surface.getRowBuffer(1))).toBe("EF 6F 00");
    });
  });

  // --- RGB

  it("plain.ppm", async () => {
    await onStreamFromGallery("plain.ppm", async (stream) => {
      const fmt = await FormatPnm.create(stream);
      expect(fmt.frames.length).toBe(1);
      const frame = fmt.frames[0]!;
      expect(frame.type).toBe("image");
      expect(frame.info.size.toString()).toBe("(4, 4)");
      expect(frame.info.fmt.signature).toBe("R8G8B8");
      expect(frame.info.vars?.ext).toBe("ppm");
      expect(frame.info.vars?.mapType).toBe("pixmap");
      expect(frame.info.vars?.dataType).toBe("plain");
      expect(frame.info.vars?.maxVal).toBe(15);

      const surface = new SurfaceStd(frame.info);
      const reader = new SurfaceReader(surface);
      await frame.read(reader);

      const row1 = surface.getRowBuffer(1);
      expect(dump(row1)).toBe("00 00 00 00 FF 77 00 00 00 00 00 00");
    });
  });
  it("raw.ppm", async () => {
    await onStreamFromGallery("raw.ppm", async (stream) => {
      const fmt = await FormatPnm.create(stream);
      expect(fmt.frames.length).toBe(1);
      const frame = fmt.frames[0]!;
      expect(frame.type).toBe("image");
      expect(frame.info.size.toString()).toBe("(4, 4)");
      expect(frame.info.fmt.signature).toBe("R8G8B8");
      expect(frame.info.vars?.ext).toBe("ppm");
      expect(frame.info.vars?.mapType).toBe("pixmap");
      expect(frame.info.vars?.dataType).toBe("raw");
      expect(frame.info.vars?.maxVal).toBe(255);

      const surface = new SurfaceStd(frame.info);
      const reader = new SurfaceReader(surface);
      await frame.read(reader);

      const row1 = surface.getRowBuffer(1);
      expect(dump(row1)).toBe("00 00 00 00 FF 77 00 00 00 00 00 00");
    });
  });

  it("plain16.ppm", async () => {
    await onStreamFromGallery("plain16.ppm", async (stream) => {
      const fmt = await FormatPnm.create(stream);
      expect(fmt.frames.length).toBe(1);
      const frame = fmt.frames[0]!;
      expect(frame.type).toBe("image");
      expect(frame.info.size.toString()).toBe("(4, 4)");
      expect(frame.info.fmt.signature).toBe("R16G16B16");
      expect(frame.info.vars?.ext).toBe("ppm");
      expect(frame.info.vars?.mapType).toBe("pixmap");
      expect(frame.info.vars?.dataType).toBe("plain");
      expect(frame.info.vars?.maxVal).toBe(0xffff);

      const surface = new SurfaceStd(frame.info);
      const reader = new SurfaceReader(surface);
      await frame.read(reader);

      const row1 = surface.getRowBuffer(1);
      const wRow1 = new Uint16Array(row1.buffer, row1.byteOffset, 4 * 3);
      expect(Array.from(wRow1)).toEqual([
        34, 65535, 58607, 0, 65432, 48324, 22, 65535, 38055, 0, 65535, 27472,
      ]);
    });
  });

  it("raw16.ppm", async () => {
    await onStreamFromGallery("raw16.ppm", async (stream) => {
      const fmt = await FormatPnm.create(stream);
      expect(fmt.frames.length).toBe(1);
      const frame = fmt.frames[0]!;
      expect(frame.type).toBe("image");
      expect(frame.info.size.toString()).toBe("(4, 4)");
      expect(frame.info.fmt.signature).toBe("R16G16B16");
      expect(frame.info.vars?.ext).toBe("ppm");
      expect(frame.info.vars?.mapType).toBe("pixmap");
      expect(frame.info.vars?.dataType).toBe("raw");
      expect(frame.info.vars?.maxVal).toBe(0xffff);

      const surface = new SurfaceStd(frame.info);
      const reader = new SurfaceReader(surface);
      await frame.read(reader);

      const row0 = surface.getRowBuffer(0);
      const wRow0 = new Uint16Array(row0.buffer, row0.byteOffset, 4 * 3);
      expect(Array.from(wRow0)).toEqual([
        45, 65477, 65535, 3, 65496, 58525, 92, 65535, 48210, 0, 65535, 34565,
      ]);

      const row1 = surface.getRowBuffer(1);
      const wRow1 = new Uint16Array(row1.buffer, row1.byteOffset, 4 * 3);
      const aRow1 = Array.from(wRow1);
      expect(aRow1).toEqual([
        34, 65535, 58607,

        0, 65432, 48324,

        22, 65535, 38055,

        0, 65535, 27472,
      ]);
    });
  });

  // ----- Bitmap
  it("plain.pbm", async () => {
    await onStreamFromGallery("plain.pbm", async (stream) => {
      const fmt = await FormatPnm.create(stream);
      const frame = fmt.frames[0]!;
      expect(frame.type).toBe("image");
      expect(frame.info.size.toString()).toBe("(24, 7)");
      expect(frame.info.fmt.signature).toBe("G1");
      expect(frame.info.vars?.ext).toBe("pbm");
      expect(frame.info.vars?.mapType).toBe("bitmap");
      expect(frame.info.vars?.dataType).toBe("plain");
      expect(frame.info.vars?.maxVal).toBe(1);

      const surface = new SurfaceStd(frame.info);
      const reader = new SurfaceReader(surface);
      await frame.read(reader);

      expect(dump(surface.getRowBuffer(0))).toBe("FF FF FF");
      expect(dump(surface.getRowBuffer(1))).toBe("86 18 61");
    });
  });

  it("raw.pbm", async () => {
    await onStreamFromGallery("raw.pbm", async (stream) => {
      const fmt = await FormatPnm.create(stream);
      const frame = fmt.frames[0]!;
      expect(frame.type).toBe("image");
      expect(frame.info.size.toString()).toBe("(24, 7)");
      expect(frame.info.fmt.signature).toBe("G1");
      expect(frame.info.vars?.ext).toBe("pbm");
      expect(frame.info.vars?.mapType).toBe("bitmap");
      expect(frame.info.vars?.dataType).toBe("raw");
      expect(frame.info.vars?.maxVal).toBe(1);

      const surface = new SurfaceStd(frame.info);
      const reader = new SurfaceReader(surface);
      await frame.read(reader);

      expect(dump(surface.getRowBuffer(0))).toBe("FF FF FF");
      expect(dump(surface.getRowBuffer(1))).toBe("86 18 61");
    });
  });
});
