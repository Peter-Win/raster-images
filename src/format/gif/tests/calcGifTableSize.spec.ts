import { calcGifTableSize } from "../calcGifTableSize";

test("calcGifTableSize", () => {
  expect(calcGifTableSize(0)).toBe(2);
  expect(calcGifTableSize(1)).toBe(4);
  expect(calcGifTableSize(2)).toBe(8);
  expect(calcGifTableSize(3)).toBe(16);
  expect(calcGifTableSize(4)).toBe(32);
  expect(calcGifTableSize(5)).toBe(64);
  expect(calcGifTableSize(6)).toBe(128);
  expect(calcGifTableSize(7)).toBe(256);
});
