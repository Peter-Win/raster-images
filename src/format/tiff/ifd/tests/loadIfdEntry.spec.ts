import { BufferStream } from "../../../../stream";
import { IfdEntry, loadIfdEntry } from "../IfdEntry";
import { IfdType } from "../IfdType";

describe("loadIfdEntry", () => {
  it("littleEndian", async () => {
    const littleEndian = true;
    const src = [
      [0x17, 1], // 0x117 StripByteCounts
      [3, 0], // type = 3
      [0xbc, 0, 0, 0], // count = 0x00BC
      [0xa6, 3, 0, 0], // offset = 0x03A6
    ];
    const srcBuf = new Uint8Array(src.flatMap((n) => n));
    expect(srcBuf.length).toBe(12);
    const stream = new BufferStream(srcBuf);
    const ifd: IfdEntry = await loadIfdEntry(stream, littleEndian);
    expect(ifd.tagId).toBe(0x117);
    expect(ifd.type).toBe(IfdType.short);
    expect(ifd.count).toBe(0xbc);
    expect(ifd.valueOffset.getUint32(0, littleEndian)).toBe(0x3a6);
  });

  it("bigEndian", async () => {
    const littleEndian = false;
    const src = [
      [1, 0x32], // 0x132 DateTime
      [0, 2], // type = 2
      [0, 0, 0, 0x14], // count = 0x0014
      [0, 0, 6, 0xb6], // offset = 0x06B6
    ];
    const srcBuf = new Uint8Array(src.flatMap((n) => n));
    expect(srcBuf.length).toBe(12);
    const stream = new BufferStream(srcBuf);
    const ifd: IfdEntry = await loadIfdEntry(stream, littleEndian);
    expect(ifd.tagId).toBe(0x132);
    expect(ifd.type).toBe(IfdType.ascii);
    expect(ifd.count).toBe(0x14);
    expect(ifd.valueOffset.getUint32(0, littleEndian)).toBe(0x6b6);
  });

  it("wrong type", async () => {
    const littleEndian = false;
    const src = [
      [1, 0x32], // 0x132 DateTime
      [0, 22], // wrong type = 22
      [0, 0, 0, 0x14], // count = 0x0014
      [0, 0, 6, 0xb6], // offset = 0x06B6
    ];
    const srcBuf = new Uint8Array(src.flatMap((n) => n));
    const stream = new BufferStream(srcBuf);
    await expect(async () =>
      loadIfdEntry(stream, littleEndian)
    ).rejects.toThrowError("Unsupported IFD type=22");
  });
});
