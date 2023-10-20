import { calcHistOffset, HistParams } from "../HistArray";

const n = HistParams.elems;

test("calcHistOffset", () => {
  expect(calcHistOffset(0, 0, 0)).toBe(0);
  expect(calcHistOffset(1, 1, 1)).toBe(0);
  expect(calcHistOffset(2, 2, 2)).toBe(0);
  expect(calcHistOffset(3, 3, 3)).toBe(0);
  expect(calcHistOffset(4, 4, 4)).toBe(n * n + n + 1);
  expect(calcHistOffset(4, 0, 0)).toBe(n * n);
  expect(calcHistOffset(0, 4, 0)).toBe(n);
  expect(calcHistOffset(0, 0, 4)).toBe(1);
});
