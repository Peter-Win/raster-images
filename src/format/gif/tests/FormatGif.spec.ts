import { loadImageFromFrame } from "../../../loadImage";
import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { dump, dumpA } from "../../../utils";
import { FormatGif } from "../FormatGif";

describe("FormatGif", () => {
  it("I8.gif", async () => {
    const fmt = await onStreamFromGallery("I8.gif", (stream) =>
      FormatGif.create(stream)
    );
    const { screen, palette } = fmt;
    expect(screen.width).toBe(0x12f);
    expect(screen.height).toBe(0x85);
    expect(screen.isGlobalTable).toBe(true);
    expect(screen.colorResolution).toBe(8);
    expect(screen.isSortedTable).toBe(false);
    expect(screen.tableSize).toBe(256);
    expect(screen.bgIndex).toBe(0);
    expect(screen.getBgIndex()).toBe(0);
    expect(screen.aspectRatio).toBe(0);

    expect(palette).toBeDefined();
    expect(palette?.length).toBe(256);
    expect(palette?.[0]).toEqual([0, 0, 0, 255]);
    expect(palette?.[1]).toEqual([255, 255, 255, 255]);
    expect(palette?.[2]).toEqual([25, 22, 23, 255]);
    expect(palette?.[3]).toEqual([252, 4, 4, 255]);
    expect(palette?.[255]).toEqual([4, 4, 4, 255]);

    expect(fmt.frames.length).toBe(1);
    const frame = fmt.frames[0]!;
    expect(frame.info.size.toString()).toBe("(303, 133)");
    expect(frame.info.fmt.colorModel).toBe("Indexed");
    expect(frame.info.fmt.depth).toBe(8);
    expect(frame.info.fmt.palette).toBe(palette);
    expect(frame.offset).toBe(0x317);
    expect(frame.size).toBe(0x5393 - 0x317);
  });

  it("I8-interlaced.gif", async () => {
    const [fmtInt, fmtNonInt] = await Promise.all(
      ["I8-interlaced.gif", "I8.gif"].map((name) =>
        onStreamFromGallery(name, (stream) => FormatGif.create(stream))
      )
    );
    expect(fmtInt?.frames.length).toBe(1);
    expect(fmtNonInt?.frames.length).toBe(1);
    const [frameInt, frameNonInt] = [fmtInt!.frames[0]!, fmtNonInt!.frames[0]!];
    const { size } = frameInt.info;
    expect(size.toString()).toBe(frameNonInt.info.size.toString());
    expect(frameInt.size).not.toBe(frameNonInt.size);
    expect(frameInt.info.vars?.interlaced).toBe(1);
    expect(frameInt.info.vars?.comment).toBe("Created with GIMP");
    expect(frameNonInt.info.vars?.interlaced).toBeUndefined();
    const imgNonInt = await loadImageFromFrame(frameNonInt);
    const imgInt = await loadImageFromFrame(frameInt);
    for (let y = 0; y < size.y; y++) {
      const rowInt = imgInt.getRowBuffer(y);
      const rowNonInt = imgNonInt.getRowBuffer(y);
      expect(dump(rowNonInt)).toBe(dump(rowInt));
    }
  });

  it("B&W.gif", async () => {
    await onStreamFromGallery("B&W.gif", async (stream) => {
      const fmt = await FormatGif.create(stream);
      expect(fmt.frames.length).toBe(1);
      const frame = fmt.frames[0]!;
      const { info } = frame;
      const { size } = info;
      expect(size.toString()).toBe("(87, 58)");
      expect(info.fmt.signature).toBe("I8");
      expect(info.fmt.palette?.length).toBe(2);
      const pal = info.fmt.palette!;
      expect(dumpA(pal[0]!)).toBe("FF FF FF FF");
      expect(dumpA(pal[1]!)).toBe("00 00 00 FF");

      const surface = await loadImageFromFrame(frame);
      const row0 = surface.getRowBuffer(0);
      for (let x = 0; x < size.x; x++) {
        expect(row0[x]).toBe(1);
      }
      const row1 = surface.getRowBuffer(1);
      for (let x = 0; x < size.x; x++) {
        if (x === 0 || x === size.x - 1) {
          expect(row1[x]).toBe(1);
        } else {
          expect(row1[x]).toBe(0);
        }
      }
    });
  });

  it("multiframe", async () => {
    await onStreamFromGallery("FILEMOVE_00.gif", async (stream) => {
      const fmt = await FormatGif.create(stream);
      expect(fmt.frames.length).toBe(34);
      expect(fmt.screen.width).toBe(272);
      expect(fmt.screen.height).toBe(60);
      expect(fmt.screen.isGlobalTable).toBe(true);
      const fr0 = fmt.frames[0]!;
      expect(fr0.graphicControlExtension).not.toBeUndefined();
    });
  });
});
