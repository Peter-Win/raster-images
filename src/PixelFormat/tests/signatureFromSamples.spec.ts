import { signatureFromSamples } from "../signatureFromSamples";

test("signatureFromSamples", () => {
  expect(signatureFromSamples([])).toBe("");
  expect(
    signatureFromSamples([
      { sign: "G", shift: 0, length: 8 },
      { sign: "A", shift: 8, length: 8 },
    ])
  ).toBe("G8A8");
  expect(
    signatureFromSamples([
      { sign: "A", shift: 16, length: 16 },
      { sign: "G", shift: 0, length: 16 },
    ])
  ).toBe("G16A16");
});
