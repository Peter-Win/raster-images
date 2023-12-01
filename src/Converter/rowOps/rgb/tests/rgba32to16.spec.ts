import { dumpW } from "../../../../utils";
import { rgba32to16 } from "../rgba32";

test("rgba32to16", () => {
  const src: [number, number, number, number][] = [
    [0, 0.25, 0.5, 1],
    [0.75, 1, 0.1, 0.5],
  ];
  const fsrc = new Float32Array(src.flatMap((n) => n));
  const width = src.length;
  const bsrc = new Uint8Array(fsrc.buffer, fsrc.byteOffset);
  const wdst = new Uint16Array(width * 4);
  const bdst = new Uint8Array(wdst.buffer, wdst.byteOffset);
  rgba32to16(width, bsrc, bdst);
  expect(dumpW(wdst)).toBe("0000 3FFF 7FFF FFFF BFFF FFFF 1999 7FFF");
});
