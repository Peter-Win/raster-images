import { dumpW } from "../../../../utils";
import { cmyka16toRgba16 } from "../cmyk16";

test("cmyka16toRgba16", () => {
  const Z = 0;
  const U = 0xffff;
  const A100 = 0xffff;
  const A50 = 0x7fff;
  // cyan(1,0,0,0)+100%, red(0,1,1,0)+50%
  const wsrc = new Uint16Array([U, Z, Z, Z, A100, Z, U, U, Z, A50]);
  const width = wsrc.length / 5;
  const bsrc = new Uint8Array(wsrc.buffer, wsrc.byteOffset);
  const wdst = new Uint16Array(4 * width);
  const bdst = new Uint8Array(wdst.buffer, wdst.byteOffset);

  cmyka16toRgba16(width, bsrc, bdst);
  expect(dumpW(wdst)).toBe("0000 FFFF FFFF FFFF FFFF 0000 0000 7FFF");
});
