import { resolutionFromMeters, resolutionToMeters } from "../resolution";

test("toMeters", () => {
  expect(resolutionToMeters(125, "meter")).toBe(125);
  expect(resolutionToMeters(1, "cm")).toBe(100);
  expect(resolutionToMeters(1, "mm")).toBe(1000);
  expect(Math.round(resolutionToMeters(72, "inch"))).toBe(2835);
  expect(resolutionToMeters(1, "inch")).toBeCloseTo(39.37);
});

test("fromMeters", () => {
  expect(Math.round(resolutionFromMeters(2834, "inch"))).toBe(72);
});
