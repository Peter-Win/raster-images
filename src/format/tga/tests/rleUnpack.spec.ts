import { dump, dumpW } from "../../../utils";
import { rleUnpack } from "../rleUnpack";

describe("rleUnpack", () => {
  it("short fill 24", () => {
    const src = new Uint8Array([0x84, 0, 0, 0xff]);
    const dst = new Uint8Array(5 * 3 + 2);
    dst.fill(0x55);
    rleUnpack(5, src, 3)(dst);
    expect(dump(dst)).toBe(
      "00 00 FF 00 00 FF 00 00 FF 00 00 FF 00 00 FF 55 55"
    );
  });
  it("long fill 24", () => {
    const src = new Uint8Array([0x89, 0, 0, 0xff]);
    const dst = new Uint8Array(5 * 3 + 2);
    dst.fill(0x55);
    const fn = rleUnpack(5, src, 3);
    fn(dst);
    expect(dump(dst)).toBe(
      "00 00 FF 00 00 FF 00 00 FF 00 00 FF 00 00 FF 55 55"
    );
    dst.fill(0xaa);
    fn(dst);
    expect(dump(dst)).toBe(
      "00 00 FF 00 00 FF 00 00 FF 00 00 FF 00 00 FF AA AA"
    );
  });
  it("short literal 24", () => {
    const src = new Uint8Array([3, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4]);
    const dst = new Uint8Array(4 * 3 + 2);
    dst.fill(0x55);
    rleUnpack(4, src, 3)(dst);
    expect(dump(dst)).toBe("01 01 01 02 02 02 03 03 03 04 04 04 55 55");
  });
  it("long literal 24", () => {
    const src = new Uint8Array([3, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4]);
    const dst = new Uint8Array(2 * 3 + 2);
    dst.fill(0x55);
    const fn = rleUnpack(2, src, 3);
    fn(dst);
    expect(dump(dst)).toBe("01 01 01 02 02 02 55 55");
    dst.fill(0xaa);
    fn(dst);
    expect(dump(dst)).toBe("03 03 03 04 04 04 AA AA");
  });
  it("fill and literal 8", () => {
    const src = new Uint8Array([0x84, 1, 0x3, 2, 3, 4, 5]);
    const width = 9;
    const dst = new Uint8Array(width + 2);
    dst.fill(0xaa);
    rleUnpack(width, src, 1)(dst);
    expect(dump(dst)).toBe("01 01 01 01 01 02 03 04 05 AA AA");
  });
  it("literal and fill 15", () => {
    // red   = 111.1100.0000.0000 = 7C00
    // green = 000.0011.1110.0000 = 03E0
    // blue  = 000.0000.0001.1111 = 001F
    // red, green, 3*blue
    const width = 5;
    const src = new Uint8Array([0x01, 0x00, 0x7c, 0xe0, 0x03, 0x82, 0x1f, 0]);
    const dst = new Uint16Array(width + 2);
    dst.fill(0xaaaa);
    rleUnpack(width, src, 2)(new Uint8Array(dst.buffer, dst.byteOffset));
    expect(dumpW(dst)).toBe("7C00 03E0 001F 001F 001F AAAA AAAA");
  });
});
