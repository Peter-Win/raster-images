import { calcPaletteSize } from "../calcPaletteSize";

test("calcPaletteSize", () => {
  expect(calcPaletteSize(1, {})).toBe(3);
  expect(calcPaletteSize(1, { dword: true })).toBe(4);
  expect(calcPaletteSize(10, {})).toBe(30);
  expect(calcPaletteSize(10, { dword: true })).toBe(40);
});
