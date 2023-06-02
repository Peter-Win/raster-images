import { dumpChunks } from "../dumpChunks";

describe("dumpChunks", () => {
  it("dumpChunks simple", () => {
    const buf = new Uint8Array(10);
    for (let i = 0; i < buf.length; i++) buf[i] = i;
    expect(dumpChunks(3, buf)).toEqual([
      "00 01 02",
      "03 04 05",
      "06 07 08",
      "09",
    ]);
    expect(dumpChunks(4, buf)).toEqual(["00 01 02 03", "04 05 06 07", "08 09"]);
    expect(dumpChunks(5, buf)).toEqual(["00 01 02 03 04", "05 06 07 08 09"]);
  });
});
