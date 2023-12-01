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
  const wsrc = new Uint16Array(
    src.flatMap((n) => n).map((n) => (1 - n) * 0xffff)
  ); // <- main src row
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
  expect(ddst[p++]).toBe("7FFF 7FFF FFFF");
});
