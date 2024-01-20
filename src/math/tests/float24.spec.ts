import { getFloat24, copyFloat24to32 } from "../float24";

describe("float24", () => {
  it("getFloat24", () => {
    expect(getFloat24(0)).toBe(0);
    expect(getFloat24(0x3f0000)).toBe(1);
    expect(getFloat24(0xc00000)).toBe(-2);
  });

  it("copyFloat24to32", () => {
    // little endian
    const srcLE = new Uint8Array([0x55, 0, 0, 0x3f, 0, 0, 0, 0, 0, 0xc0]);
    const dstLE = new Float32Array(3);
    copyFloat24to32(3, srcLE, 1, dstLE, true);
    expect(Array.from(dstLE)).toEqual([1, 0, -2]);

    // big endian
    const srcBE = new Uint8Array([0xaa, 0xaa, 0x3f, 0, 0, 0, 0, 0, 0xc0, 0, 0]);
    const dstBE = new Float32Array(3);
    copyFloat24to32(3, srcBE, 2, dstBE, false);
    expect(Array.from(dstBE)).toEqual([1, 0, -2]);
  });
});
