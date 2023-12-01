import { BufferStream, readByte } from "../../../stream";
import { dump } from "../../../utils";
import { readPsdSection } from "../psdSection";

describe("psdSection", () => {
  it("readPsdSection", async () => {
    const buf = new Uint8Array(
      [[0, 0, 0, 5], [1, 2, 3, 4, 5, 0, 0, 0], [27]].flatMap((n) => n)
    );
    const stream = new BufferStream(buf);
    await readPsdSection(stream, 4, async ({ size, startPos, endPos }) => {
      expect(size).toBe(5);
      expect(startPos).toBe(4);
      expect(endPos).toBe(12);
      const data = await stream.read(size);
      expect(dump(data)).toBe("01 02 03 04 05");
    });
    expect(await readByte(stream)).toBe(27);
  });
});
