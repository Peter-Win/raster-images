import { GifLogicalScreen } from "../GifLogicalScreen";

describe("GifLogicalScreen", () => {
  it("readFromBuf", () => {
    // 2F 01 - width
    // 85 00 - height
    // F7 - flags
    // 00 - bgIndex
    // 00 - aspect ratio
    const buf = new Uint8Array([0x2f, 1, 0x85, 0, 0xf7, 0, 0]);
    const descr = new GifLogicalScreen();
    descr.readFromBuf(buf);
    expect(descr.width).toBe(303);
    expect(descr.height).toBe(133);
    expect(descr.isGlobalTable).toBe(true);
    expect(descr.colorResolution).toBe(8);
    expect(descr.isSortedTable).toBe(false);
    expect(descr.tableSize).toBe(256);
  });

  it("readFromBuf FILEMOVE", () => {
    // 10 01 - width
    // 3C 00 - height
    // A2 - flags
    // 00 - bgIndex
    // 00 - aspect ratio
    const buf = new Uint8Array([0x10, 1, 0x3c, 0, 0xa2, 0, 0]);
    const descr = new GifLogicalScreen();
    descr.readFromBuf(buf);
    expect(descr.width).toBe(272);
    expect(descr.height).toBe(60);
    expect(descr.isGlobalTable).toBe(true);
    expect(descr.colorResolution).toBe(3);
    expect(descr.isSortedTable).toBe(false);
    expect(descr.tableSize).toBe(8);
  });
});
