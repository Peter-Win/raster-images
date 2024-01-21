import { dumpW } from "../../../../utils";
import { decodeWords } from "../decodeWords";

describe("decodeWords", () => {
  it("words LE same", () => {
    const bbuf = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const wbuf = new Uint16Array(bbuf.buffer, bbuf.byteOffset);
    decodeWords(true, 3, bbuf, 0, bbuf, 0);
    expect(dumpW(wbuf)).toBe("0100 0302 0504");
  });
  it("words LE different", () => {
    // skip 1 word
    const src = new Uint8Array([0x55, 0x55, 0, 1, 2, 3]);
    const dst = new Uint8Array(src.length + 2);
    dst.fill(0xaa);
    const wdst = new Uint16Array(dst.buffer, dst.byteOffset);
    decodeWords(true, 2, src, 2, dst, 4);
    expect(dumpW(wdst)).toBe("AAAA AAAA 0100 0302");
  });

  it("words BE same", () => {
    const bbuf = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const wbuf = new Uint16Array(bbuf.buffer, bbuf.byteOffset);
    decodeWords(false, 3, bbuf, 0, bbuf, 0);
    expect(dumpW(wbuf)).toBe("0001 0203 0405");
  });
  it("words BE different", () => {
    // skip 1 word
    const src = new Uint8Array([0x55, 0x55, 0, 1, 2, 3]);
    const dst = new Uint8Array(src.length + 2);
    dst.fill(0xaa);
    const wdst = new Uint16Array(dst.buffer, dst.byteOffset);
    decodeWords(false, 2, src, 2, dst, 4);
    expect(dumpW(wdst)).toBe("AAAA AAAA 0001 0203");
  });
});
