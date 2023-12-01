import { dumpW } from "../../../../utils";
import { cmyk8to16, cmyka8to16 } from "../cmyk8";

test("cmyk8to16", () => {
  const src = new Uint8Array([0, 0x12, 0xab, 0xff]);
  const wdst = new Uint16Array(src.length);
  const bdst = new Uint8Array(wdst.buffer, wdst.byteOffset);
  cmyk8to16(1, src, bdst);
  expect(dumpW(wdst)).toBe("0000 1212 ABAB FFFF");
});

test("cmyka8to16", () => {
  const src = new Uint8Array([0, 0x12, 0x58, 0xab, 0xff]);
  const wdst = new Uint16Array(src.length);
  const bdst = new Uint8Array(wdst.buffer, wdst.byteOffset);
  cmyka8to16(1, src, bdst);
  expect(dumpW(wdst)).toBe("0000 1212 5858 ABAB FFFF");
});
