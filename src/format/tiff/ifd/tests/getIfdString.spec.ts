import { BufferStream } from "../../../../stream";
import { getIfdString, loadIfdEntry } from "../IfdEntry";
import { IfdType } from "../IfdType";

describe("getIfdString", () => {
  it("Ascii", async () => {
    const littleEndian = false;
    const msg = "Hello!\0";
    const src = [
      [1, 0x31],
      [0, IfdType.ascii],
      [0, 0, 0, msg.length],
      [0, 0, 0, 12],
      Array.from(msg).map((s) => s.charCodeAt(0)),
    ];
    const stream = new BufferStream(new Uint8Array(src.flatMap((n) => n)));
    const ifd = await loadIfdEntry(stream, littleEndian);
    // test
    const str = await getIfdString(ifd, stream, littleEndian);
    expect(str).toBe("Hello!");
  });

  it("Ascii short", async () => {
    const littleEndian = false;
    const msg = "Yo\0";
    const src = [
      [1, 0x31],
      [0, IfdType.ascii],
      [0, 0, 0, msg.length],
      Array.from(msg).map((s) => s.charCodeAt(0)),
      [0],
    ];
    const stream = new BufferStream(new Uint8Array(src.flatMap((n) => n)));
    const ifd = await loadIfdEntry(stream, littleEndian);
    // test
    const str = await getIfdString(ifd, stream, littleEndian);
    expect(str).toBe("Yo");
  });

  it("wrong type", async () => {
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
    await expect(() =>
      getIfdString(ifd, stream, littleEndian)
    ).rejects.toThrowError("Can't get string from Long");
  });
});
