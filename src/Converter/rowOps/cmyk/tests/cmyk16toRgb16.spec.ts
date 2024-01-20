import { dumpW } from "../../../../utils";
import { cmyk16toRgb16 } from "../cmyk16";

test("cmyk16toRgb16", () => {
  // @see https://www.rapidtables.com/convert/color/cmyk-to-rgb.html
  const src: [number, number, number, number][] = [
    [0, 0, 0, 1], // Black
    [0, 0, 0, 0], // White
    [0, 1, 1, 0], // Red
    [1, 0, 1, 0], // Green
    [1, 1, 0, 0], // Blue
    [0, 0, 1, 0], // Yellow
    [1, 0, 0, 0], // Cyan
    [0, 1, 0, 0], // Magenta
    [0.5, 0.5, 0, 0],
  ];
  const width = src.length;
  const wsrc = new Uint16Array(src.flatMap((n) => n).map((n) => n * 0xffff)); // <- main src row
  const bsrc = new Uint8Array(wsrc.buffer, wsrc.byteOffset);
  const wdst = new Uint16Array(width * 3); // <- main dst row
  const bdst = new Uint8Array(wdst.buffer, wdst.byteOffset);

  cmyk16toRgb16(width, bsrc, bdst);

  const ddst = dumpW(wdst)
    .replace(/(.... .... ....) /g, "$1:")
    .split(":");
  let p = 0;
  expect(ddst[p++]).toBe("0000 0000 0000"); // Black
  expect(ddst[p++]).toBe("FFFF FFFF FFFF"); // White
  expect(ddst[p++]).toBe("FFFF 0000 0000"); // Red
  expect(ddst[p++]).toBe("0000 FFFF 0000"); // Green
  expect(ddst[p++]).toBe("0000 0000 FFFF"); // Blue
  expect(ddst[p++]).toBe("FFFF FFFF 0000"); // Yellow
  expect(ddst[p++]).toBe("0000 FFFF FFFF"); // Cyan
  expect(ddst[p++]).toBe("FFFF 0000 FFFF"); // Magenta
  expect(ddst[p++]).toBe("8000 8000 FFFF");
});

test("cmyk16toRgb16 max", () => {
  const F = 0xffff;
  const src: [number, number, number, number][] = [
    [0, 0, 0, 0], // white
    [F, 0, 0, 0], // cyan
    [0, F, 0, 0], // mahenta
    [0, 0, F, 0], // yellow
    [0, 0, 0, F], // black
  ];
  const width = src.length;
  const wsrc = new Uint16Array(src.flatMap((n) => n));
  const bsrc = new Uint8Array(wsrc.buffer, wsrc.byteOffset);
  const wdst = new Uint16Array(3 * width);
  const bdst = new Uint8Array(wdst.buffer, wdst.byteOffset);
  cmyk16toRgb16(width, bsrc, bdst);
  expect(dumpW(wdst, 0, 3)).toBe("FFFF FFFF FFFF"); // white
  expect(dumpW(wdst, 3, 6)).toBe("0000 FFFF FFFF"); // cyan
  expect(dumpW(wdst, 6, 9)).toBe("FFFF 0000 FFFF"); // magenta
  expect(dumpW(wdst, 9, 12)).toBe("FFFF FFFF 0000"); // yellow
  expect(dumpW(wdst, 12, 15)).toBe("0000 0000 0000"); // black
});
