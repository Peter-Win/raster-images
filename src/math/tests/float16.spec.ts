import { getFloat16 } from "../float16";

// Test data from
// https://en.wikipedia.org/wiki/Half-precision_floating-point_format

test("float16", () => {
  expect(getFloat16(0)).toBe(0);
  // 0 00000 0000000001	smallest positive subnormal number
  expect(getFloat16(1)).toBeCloseTo(0.000000059604645, 10);
  // 0 00000 1111111111 largest subnormal number
  expect(getFloat16(0x03ff)).toBeCloseTo(0.000060975552, 7);
  // 0 00001 0000000000 smallest positive normal number
  expect(getFloat16(0x0400)).toBe(0.00006103515625);
  // 0 01101 0101010101  nearest value to 1/3
  expect(getFloat16(0x3555)).toBeCloseTo(0.33325195, 6);
  // 0 01110 1111111111  largest number less than one
  expect(getFloat16(0x3bff)).toBeCloseTo(0.99951172, 7);
  // 0 01111 0000000000  one
  expect(getFloat16(0x3c00)).toBe(1);
  // 0 01111 0000000001  smallest number larger than one
  expect(getFloat16(0x3c01)).toBeCloseTo(1.00097656, 6);
  // 0 11110 1111111111  largest normal number
  expect(getFloat16(0x7bff)).toBe(65504);
  // 1 10000 0000000000 -2
  expect(getFloat16(0xc000)).toBe(-2);
  // 0 01110 000000000
  expect(getFloat16(0x3800)).toBe(0.5);
  // ∞ −0 −∞  - Эти случаи нам не нужны, т.к. они не могут использоваться как пиксельные данные
});
