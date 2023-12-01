import { dumpW } from "../../../../utils";
import { gray32toGray16 } from "../gray32";

test("gray32toGray16", () => {
  const fsrc = new Float32Array([0, 0.25, 0.5, 0.75, 1]);
  const bsrc = new Uint8Array(fsrc.buffer, fsrc.byteOffset);
  const wdst = new Uint16Array(fsrc.length);
  const bdst = new Uint8Array(wdst.buffer, wdst.byteOffset);
  gray32toGray16(fsrc.length, bsrc, bdst);
  expect(dumpW(wdst)).toBe("0000 3FFF 7FFF BFFF FFFF");
});
