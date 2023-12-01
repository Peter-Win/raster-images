import { BufferStream } from "../../../stream";
import { readPascalString } from "../psdDataUtils";

describe("readPascalString", () => {
  // a null name consists of two bytes of 0
  it("empty pad 2", async () => {
    const stream = new BufferStream(new Uint8Array(100));
    const s = await readPascalString(stream, 2);
    expect(s).toBe("");
    expect(await stream.getPos()).toBe(2);
  });
});
