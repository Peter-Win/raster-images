import { dumpW } from "../../../../utils";
import { rgb32to16 } from "../rgb32";

test("rgb32to16", () => {
  const src: [number, number, number][] = [
    [0, 0.25, 0.5],
    [0.75, 1, 0.1],
  ];
  const fsrc = new Float32Array(src.flatMap((n) => n));
  const width = src.length;
  const bsrc = new Uint8Array(fsrc.buffer, fsrc.byteOffset);
  const wdst = new Uint16Array(width * 3);
  const bdst = new Uint8Array(wdst.buffer, wdst.byteOffset);
  rgb32to16(width, bsrc, bdst);
  expect(dumpW(wdst)).toBe("0000 3FFF 7FFF BFFF FFFF 1999");
});
