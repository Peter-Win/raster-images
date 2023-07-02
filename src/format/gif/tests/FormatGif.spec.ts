import { onStreamFromGallery } from "../../../tests/streamFromGallery";
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
});
