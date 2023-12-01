import { dump } from "../../utils";
import { unpackBits } from "../PackBits";

describe("unpackBits", () => {
  it("repeated", () => {
    const srcBuf = new Uint8Array([0xfe, 0xaa]);
    const width = 3;
    const dstBuf = new Uint8Array(width);
    const pos = unpackBits(dstBuf, srcBuf);
    expect(pos).toBe(srcBuf.length);
    expect(dump(dstBuf)).toBe("AA AA AA");
  });

  it("literal", () => {
    const srcBuf = new Uint8Array([2, 0x80, 0, 0x2a]);
    const width = 3;
    const dstBuf = new Uint8Array(width);
    const pos = unpackBits(dstBuf, srcBuf);
    expect(pos).toBe(srcBuf.length);
    expect(dump(dstBuf)).toBe("80 00 2A");
  });

  // example from https://en.wikipedia.org/wiki/PackBits
  it("complex", () => {
    const result =
      "AA AA AA 80 00 2A AA AA AA AA 80 00 2A 22 AA AA AA AA AA AA AA AA AA AA";
    const width = (result.length + 1) / 3;
    const srcA = [
      0xfe, 0xaa, 0x02, 0x80, 0, 0x2a, 0xfd, 0xaa, 0x03, 0x80, 0, 0x2a, 0x22,
      0xf7, 0xaa,
    ];
    const srcBuf = new Uint8Array(srcA);
    const dstBuf = new Uint8Array(width);
    const pos = unpackBits(dstBuf, srcBuf);
    expect(pos).toBe(srcBuf.length);
    expect(dump(dstBuf)).toBe(result);
  });
});
