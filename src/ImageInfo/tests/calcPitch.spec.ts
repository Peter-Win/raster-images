import { calcPitch } from "../calcPitch";

describe("calcPitch", () => {
  it("not aligned", () => {
    expect(calcPitch(1, 1)).toBe(1);
    expect(calcPitch(2, 1)).toBe(1);
    expect(calcPitch(7, 1)).toBe(1);
    expect(calcPitch(8, 1)).toBe(1);
    expect(calcPitch(9, 1)).toBe(2);
    expect(calcPitch(1, 2)).toBe(1);
    expect(calcPitch(4, 2)).toBe(1);
    expect(calcPitch(5, 2)).toBe(2);
    expect(calcPitch(1, 4)).toBe(1);
    expect(calcPitch(2, 4)).toBe(1);
    expect(calcPitch(3, 4)).toBe(2);
    expect(calcPitch(4, 4)).toBe(2);
    expect(calcPitch(1, 8)).toBe(1);
    expect(calcPitch(2, 8)).toBe(2);
    expect(calcPitch(1, 15)).toBe(2);
    expect(calcPitch(16, 15)).toBe(32);
    expect(calcPitch(1, 16)).toBe(2);
    expect(calcPitch(16, 16)).toBe(32);
    expect(calcPitch(1, 24)).toBe(3);
    expect(calcPitch(1, 32)).toBe(4);
    expect(calcPitch(1, 40)).toBe(5);
    expect(calcPitch(1, 64)).toBe(8);
    expect(calcPitch(1, 96)).toBe(12);
    expect(calcPitch(1, 128)).toBe(16);
  });
  it("aligned", () => {
    expect(calcPitch(1, 8, 0)).toBe(1);
    expect(calcPitch(1, 8, 1)).toBe(1);
    expect(calcPitch(1, 8, 4)).toBe(4);
    expect(calcPitch(1, 8, 16)).toBe(16);
    expect(calcPitch(3, 8, 4)).toBe(4);
    expect(calcPitch(4, 8, 4)).toBe(4);
    expect(calcPitch(5, 8, 4)).toBe(8);
    expect(calcPitch(8, 8, 4)).toBe(8);
  });
});
