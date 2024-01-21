import { dumpA } from "../../../../utils";
import { decodeDwords } from "../decodeDwords";

describe("decodeDwords", () => {
  it("dwords LE same", () => {
    const bbuf = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
    const dbuf = new Uint32Array(bbuf.buffer, bbuf.byteOffset);
    decodeDwords(true, 2, bbuf, 0, bbuf, 0);
    expect(dumpA(Array.from(dbuf))).toBe("03020100 07060504");
  });
  it("dwords LE different", () => {
    // skip 1 dword
    const src = new Uint8Array([
      0x55, 0x55, 0x55, 0x55, 0, 1, 2, 3, 4, 5, 6, 7,
    ]);
    const dst = new Uint8Array(src.length + 4);
    dst.fill(0xaa);
    const ddst = new Uint32Array(dst.buffer, dst.byteOffset);
    decodeDwords(true, 2, src, 4, dst, 8);
    expect(dumpA(Array.from(ddst))).toBe("AAAAAAAA AAAAAAAA 03020100 07060504");
  });

  it("dwords BE same", () => {
    const bbuf = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
    const dbuf = new Uint32Array(bbuf.buffer, bbuf.byteOffset);
    decodeDwords(false, 2, bbuf, 0, bbuf, 0);
    expect(dumpA(Array.from(dbuf))).toBe("010203 04050607");
  });
  it("dwords BE different", () => {
    // skip 1 dword
    const src = new Uint8Array([
      0x55, 0x55, 0x55, 0x55, 0, 1, 2, 3, 4, 5, 6, 7,
    ]);
    const dst = new Uint8Array(src.length + 4); // skip 2 dwords
    dst.fill(0xaa);
    const ddst = new Uint32Array(dst.buffer, dst.byteOffset);
    decodeDwords(false, 2, src, 4, dst, 8);
    expect(dumpA(Array.from(ddst))).toBe("AAAAAAAA AAAAAAAA 010203 04050607");
  });
});
