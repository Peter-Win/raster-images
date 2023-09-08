import { gifRowOrderInterlaced } from "../gifRowOrderInterlaced";

// from https://www.w3.org/Graphics/GIF/spec-gif89a.txt
// The Following example illustrates how the rows of an interlaced image are ordered.
//       Row Number                                        Interlace Pass
//  0    -----------------------------------------       1
//  1    -----------------------------------------                         4
//  2    -----------------------------------------                   3
//  3    -----------------------------------------                         4
//  4    -----------------------------------------             2
//  5    -----------------------------------------                         4
//  6    -----------------------------------------                   3
//  7    -----------------------------------------                         4
//  8    -----------------------------------------       1
//  9    -----------------------------------------                         4
//  10   -----------------------------------------                   3
//  11   -----------------------------------------                         4
//  12   -----------------------------------------             2
//  13   -----------------------------------------                         4
//  14   -----------------------------------------                   3
//  15   -----------------------------------------                         4
//  16   -----------------------------------------       1
//  17   -----------------------------------------                         4
//  18   -----------------------------------------                   3
//  19   -----------------------------------------                         4

test("gifRowOrderInterlaced", () => {
  expect(Array.from(gifRowOrderInterlaced(20)).join(" ")).toBe(
    "0 8 16 4 12 2 6 10 14 18 1 3 5 7 9 11 13 15 17 19"
  );
});
