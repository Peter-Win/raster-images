import { dump, dumpW } from "../../../../utils";
import { joinPlanes } from "../joinPlanes";

describe("joinPlanes", () => {
  it("8x4", () => {
    const width = 5;
    const planes: Uint8Array[] = [
      [1, 2, 3, 4, 5],
      [0x11, 0x12, 0x13, 0x14, 0x15],
      [0x21, 0x22, 0x23, 0x24, 0x25],
      [0x31, 0x32, 0x33, 0x34, 0x35],
    ].map((a) => new Uint8Array(a));
    planes.forEach((row) => expect(row.length).toBe(width));
    const dst = new Uint8Array(width * planes.length);
    joinPlanes(width, 1, planes, dst);
    expect(dump(dst)).toBe(
      "01 11 21 31 02 12 22 32 03 13 23 33 04 14 24 34 05 15 25 35"
    );
  });

  it("16x3", () => {
    const width = 4;
    const planes: Uint8Array[] = [
      [0x101, 0x102, 0x103, 0x104],
      [0x201, 0x202, 0x203, 0x204],
      [0x301, 0x302, 0x303, 0x304],
    ].map((a) => {
      const b = new Uint16Array(a);
      return new Uint8Array(b.buffer, b.byteOffset);
    });
    planes.forEach((row) => expect(row.length).toBe(width * 2));
    const wdst = new Uint16Array(width * planes.length);
    const bdst = new Uint8Array(wdst.buffer, wdst.byteOffset);
    joinPlanes(width, 2, planes, bdst);
    expect(dumpW(wdst)).toBe(
      "0101 0201 0301 0102 0202 0302 0103 0203 0303 0104 0204 0304"
    );
  });

  it("64x2", () => {
    const width = 3;
    const sampleSize = 8;
    const planes: Uint8Array[] = [
      [101.25, 102.5, 103.75],
      [201.25, 202.5, 203.75],
      [301.25, 302.5, 303.75],
    ].map((a) => {
      const b = new Float64Array(a);
      return new Uint8Array(b.buffer, b.byteOffset);
    });
    planes.forEach((row) => expect(row.length).toBe(width * sampleSize));
    const fdst = new Float64Array(width * planes.length);
    const bdst = new Uint8Array(fdst.buffer, fdst.byteOffset);
    joinPlanes(width, sampleSize, planes, bdst);
    const fdump = Array.from(fdst)
      .map((n) => String(n))
      .join(" ");
    expect(fdump).toBe(
      "101.25 201.25 301.25 102.5 202.5 302.5 103.75 203.75 303.75"
    );
  });
});
