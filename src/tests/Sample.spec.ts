import { Sample, equalSamplesList } from "../Sample";

test("equalSamplesList", () => {
  const bgra: Sample[] = [
    { shift: 0, length: 8, sign: "B" },
    { shift: 8, length: 8, sign: "G" },
    { shift: 16, length: 8, sign: "R" },
    { shift: 24, length: 8, sign: "A" },
  ];
  const rgba: Sample[] = [
    { shift: 0, length: 8, sign: "R" },
    { shift: 8, length: 8, sign: "G" },
    { shift: 16, length: 8, sign: "B" },
    { shift: 24, length: 8, sign: "A" },
  ];
  expect(equalSamplesList(bgra, rgba)).toBe(false);
  expect(equalSamplesList(bgra, [...bgra])).toBe(true);
});
