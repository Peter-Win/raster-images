import { rangeLimit } from "../rangeLimit";

test("rangeLimit", () => {
  expect(rangeLimit(-1000)).toBe(0);
  expect(rangeLimit(-1)).toBe(0);
  expect(rangeLimit(0)).toBe(0);
  expect(rangeLimit(1)).toBe(1);
  expect(rangeLimit(2)).toBe(2);

  expect(rangeLimit(253)).toBe(253);
  expect(rangeLimit(254)).toBe(254);
  expect(rangeLimit(255)).toBe(255);
  expect(rangeLimit(256)).toBe(255);
  expect(rangeLimit(257)).toBe(255);
  expect(rangeLimit(1000)).toBe(255);
});
