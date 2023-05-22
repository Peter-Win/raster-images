import { Cvt15to24Fast, Cvt15to24Quality } from "../Cvt15to24";

// max value = 31
const pk = (r5: number, g5: number, b5: number): number =>
  b5 | (g5 << 5) | (r5 << 10);

const strTri = (arr: number[]): string[] =>
  arr.reduce(
    (acc, v, i) =>
      i % 3 === 0
        ? [...acc, v.toString(16).toUpperCase()]
        : [
            ...acc.slice(0, -1),
            `${acc[acc.length - 1]},${v.toString(16).toUpperCase()}`,
          ],
    [] as string[]
  );

// black, white, red, green, blue, gray50%
const arr5 = [
  pk(0, 0, 0),
  pk(31, 31, 31),
  pk(31, 0, 0),
  pk(0, 31, 0),
  pk(0, 0, 31),
  pk(1, 2, 3),
  pk(4, 5, 6),
  pk(7, 8, 9),
  pk(15, 16, 30),
];

test("Cvt15to24Quality", () => {
  const src = new Uint16Array(arr5);
  const dst = new Uint8Array(3 * arr5.length);
  Cvt15to24Quality.cvt(
    arr5.length,
    src.buffer,
    src.byteOffset,
    dst.buffer,
    dst.byteOffset
  );
  const b3 = strTri(Array.from(dst));
  expect(b3).toEqual([
    "0,0,0",
    "FF,FF,FF",
    "0,0,FF",
    "0,FF,0",
    "FF,0,0",
    "18,10,8", // +0
    "31,29,21", // +1
    "4A,42,39", // +2 +2 +1
    "F7,84,7B", // 0b1111011 = 7B, 1.0000 => 100 | 1000.0000 = 1000.0100 = 84, F7=11110111
  ]);
});

test("Cvt15to24Fast", () => {
  const src = new Uint16Array(arr5);
  const dst = new Uint8Array(3 * arr5.length);
  Cvt15to24Fast.cvt(
    arr5.length,
    src.buffer,
    src.byteOffset,
    dst.buffer,
    dst.byteOffset
  );
  const b3 = strTri(Array.from(dst));
  expect(b3).toEqual([
    "0,0,0",
    "F8,F8,F8",
    "0,0,F8",
    "0,F8,0",
    "F8,0,0",
    "18,10,8",
    "30,28,20",
    "48,40,38",
    "F0,80,78",
  ]);
});
