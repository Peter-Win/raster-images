import { dump } from "../../../../../utils";
import { BitFiller } from "../BitFiller";
import { MHIndex } from "../mhCodes";

describe("BitFiller", () => {
  it("zero length", () => {
    const dst = new Uint8Array(3);
    const bf = new BitFiller(dst);
    bf.fill(MHIndex.white, 0);
    bf.fill(MHIndex.black, 0);
    expect(dump(dst)).toBe("00 00 00");
    expect(bf.bitPos).toBe(0);
    expect(bf.bytePos).toBe(0);
  });
  it("partial byte", () => {
    const dst = new Uint8Array(2);
    const bf = new BitFiller(dst);
    // ..XXX.X.|
    bf.fill(MHIndex.white, 2);
    bf.fill(MHIndex.black, 3);
    bf.fill(MHIndex.white, 1);
    bf.fill(MHIndex.black, 1);
    expect(dump(dst)).toBe("3A 00"); // 0011 1010
    expect(bf.bitPos).toBe(7);
    expect(bf.bytePos).toBe(0);
  });
  it("single byte and next pos", () => {
    const dst = new Uint8Array(2);
    const bf = new BitFiller(dst);
    // ...XXXXX|........
    bf.fill(MHIndex.white, 3);
    bf.fill(MHIndex.black, 5);
    expect(dump(dst)).toBe("1F 00"); // 0001 1111
    expect(bf.bitPos).toBe(0);
    expect(bf.bytePos).toBe(1);
  });
  it("2 partial bytes", () => {
    // ...XXXXX|...XXXX.|
    const dst = new Uint8Array(2);
    const bf = new BitFiller(dst);
    bf.fill(MHIndex.white, 3);
    bf.fill(MHIndex.black, 5);
    bf.fill(MHIndex.white, 3);
    bf.fill(MHIndex.black, 4);
    expect(dump(dst)).toBe("1F 1E"); // 0001 1111
    expect(bf.bitPos).toBe(7);
    expect(bf.bytePos).toBe(1);
  });
  it("2 full bytes", () => {
    const dst = new Uint8Array(2);
    const bf = new BitFiller(dst);
    bf.fill(MHIndex.white, 8);
    bf.fill(MHIndex.black, 8);
    expect(dump(dst)).toBe("00 FF");
    expect(bf.bitPos).toBe(0);
    expect(bf.bytePos).toBe(2);
  });
  it("overflow to second byte", () => {
    // .....XXX|XXXX....
    const dst = new Uint8Array(2);
    const bf = new BitFiller(dst);
    bf.fill(MHIndex.white, 5);
    bf.fill(MHIndex.black, 7);
    expect(dump(dst)).toBe("07 F0");
    expect(bf.bitPos).toBe(4);
    expect(bf.bytePos).toBe(1);
  });
  it("long partal", () => {
    // 0        1        2        3        4        5        6
    // .....XXX|XXXXXXXX|XXXXXXXX|XX......|........|........|..XXX...
    // <-5-><----------21----------><-----------24------------><3>
    const dst = new Uint8Array(7);
    const bf = new BitFiller(dst);
    bf.fill(MHIndex.white, 5);
    bf.fill(MHIndex.black, 21);
    bf.fill(MHIndex.white, 24);
    bf.fill(MHIndex.black, 3);
    expect(dump(dst)).toBe("07 FF FF C0 00 00 38");
    expect(bf.bitPos).toBe(5);
    expect(bf.bytePos).toBe(6);
  });
  it("long byte aligned", () => {
    // WBBBWWWWB
    const dst = new Uint8Array(9);
    const bf = new BitFiller(dst);
    bf.fill(MHIndex.white, 8);
    bf.fill(MHIndex.black, 24);
    bf.fill(MHIndex.white, 32);
    bf.fill(MHIndex.black, 8);
    expect(dump(dst)).toBe("00 FF FF FF 00 00 00 00 FF");
    expect(bf.bitPos).toBe(0);
    expect(bf.bytePos).toBe(9);
  });
});
