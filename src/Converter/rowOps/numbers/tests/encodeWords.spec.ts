import { dump } from "../../../../utils";
import { encodeWords } from "../encodeWords";

describe("encodeWords", () => {
  it("copy", () => {
    const count = 3;
    const firstWord = 1;
    const offset = firstWord * 2;
    const wsrc = new Uint16Array([0x5555, 0x1234, 0xff, 0xff00, 0xaaaa]);
    const bsrc = new Uint8Array(wsrc.buffer, wsrc.byteOffset);
    // little endian
    const dstLE = new Uint8Array(bsrc.length);
    dstLE.fill(0x11);
    encodeWords(true, count, bsrc, offset, dstLE, offset);
    expect(dump(dstLE)).toBe("11 11 34 12 FF 00 00 FF 11 11");
    // big endian
    const dstBE = new Uint8Array(bsrc.length);
    dstBE.fill(0x33);
    encodeWords(false, count, bsrc, offset, dstBE, offset);
    expect(dump(dstBE)).toBe("33 33 12 34 00 FF FF 00 33 33");
  });
});
