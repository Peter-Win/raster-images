import { parseSignature } from "../parseSignature";

describe("parseSignature", () => {
  it("valid signatures", () => {
    expect(parseSignature("R8G8B8")).toEqual([
      { sign: "R", shift: 0, length: 8 },
      { sign: "G", shift: 8, length: 8 },
      { sign: "B", shift: 16, length: 8 },
    ]);
    expect(parseSignature("R8G8B8A8")).toEqual([
      { sign: "R", shift: 0, length: 8 },
      { sign: "G", shift: 8, length: 8 },
      { sign: "B", shift: 16, length: 8 },
      { sign: "A", shift: 24, length: 8 },
    ]);
    expect(parseSignature("C8M8Y8K8")).toEqual([
      { sign: "C", shift: 0, length: 8 },
      { sign: "M", shift: 8, length: 8 },
      { sign: "Y", shift: 16, length: 8 },
      { sign: "K", shift: 24, length: 8 },
    ]);
    expect(parseSignature("B5G6R5")).toEqual([
      { sign: "B", shift: 0, length: 5 },
      { sign: "G", shift: 5, length: 6 },
      { sign: "R", shift: 11, length: 5 },
    ]);
    expect(parseSignature("B16G16R16")).toEqual([
      { sign: "B", shift: 0, length: 16 },
      { sign: "G", shift: 16, length: 16 },
      { sign: "R", shift: 32, length: 16 },
    ]);
  });
  it("invalid signatures", () => {
    expect(() => parseSignature("")).toThrowError(
      `Invalid pixel format signature []`
    );
    expect(() => parseSignature("RGB")).toThrowError(
      `Invalid pixel format signature [RGB]`
    );
    expect(() => parseSignature("C8M8Y8K8A8X8")).toThrowError(
      `Too many samples in [C8M8Y8K8A8X8]`
    );
    expect(() => parseSignature("A1B1C1D1")).toThrowError(
      "Unknown sample letter [D]"
    );
    expect(() => parseSignature("R1G1B1A0")).toThrowError(
      "Invalid sample size 0 in [R1G1B1A0]"
    );
    expect(() => parseSignature("G65")).toThrowError(
      "Invalid sample size 65 in [G65]"
    );
  });
});
