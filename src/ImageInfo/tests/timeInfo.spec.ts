import { parseStrTime, timeToString } from "../timeInfo";

test("timeToString", () => {
  const t = new Date(2023, 11, 6, 13, 5, 22);
  expect(timeToString(t)).toBe("2023-12-06 13:05:22");
});

test("parseStrTime", () => {
  expect(parseStrTime("2023-01-14")).toEqual(new Date(2023, 0, 14));
  expect(parseStrTime("2023-12-03 08:09")).toEqual(new Date(2023, 11, 3, 8, 9));
  expect(parseStrTime("2023-01-14 14:59:34")).toEqual(
    new Date(2023, 0, 14, 14, 59, 34)
  );
});
