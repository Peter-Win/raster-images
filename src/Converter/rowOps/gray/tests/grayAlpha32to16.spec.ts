import { dumpW } from "../../../../utils";
import { grayAlpha32to16 } from "../gray32";

test("grayAlpha32to16", () => {
  const src: [number, number][] = [
    [0, 1],
    [0.25, 0.5],
  ];
  const width = src.length;
  const fsrc = new Float32Array(src.flatMap((n) => n));
  const bsrc = new Uint8Array(fsrc.buffer, fsrc.byteOffset);
  const wdst = new Uint16Array(width * 2);
  const bdst = new Uint8Array(wdst.buffer, wdst.byteOffset);
  grayAlpha32to16(width, bsrc, bdst);
  expect(dumpW(wdst)).toBe("0000 FFFF 3FFF 7FFF");
});
