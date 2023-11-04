import { rlePack } from "../rlePack";
import { dump } from "../../../utils";

describe("rlePack", () => {
  it("short fill 1", () => {
    const src = new Uint8Array(5);
    src.fill(9);
    const dst = rlePack(src.length, 1)(src);
    expect(dump(dst)).toBe("84 09");
  });
  it("short literal 1", () => {
    const src = new Uint8Array([1, 2, 3, 4, 5, 6, 7]);
    const dst = rlePack(src.length, 1)(src);
    expect(dump(dst)).toBe("06 01 02 03 04 05 06 07");
  });
  it("long fill 1", () => {
    const src = new Uint8Array(300);
    src.fill(10);
    const dst = rlePack(src.length, 1)(src);
    expect(dump(dst)).toBe("FF 0A FF 0A AB 0A");
  });
  it("long literal", () => {
    const src = new Uint8Array(300);
    for (let i = 0; i < src.length; i++) src[i] = i;
    // так как в байте макс значение 255, то предполагается отсечение
    const dst = rlePack(src.length, 1)(src);
    // Должно получиться 3 чанка 128+128+44
    expect(dst.length).toBe(303); // тот случай, когда упакованные данные занимают больше места, чем исходные.
    expect(dst[0]).toBe(0x7f);
    expect(dst[1]).toBe(0);
    expect(dst[2]).toBe(1);
    expect(dst[3]).toBe(2);
    expect(dst[128]).toBe(127);
    expect(dst[129]).toBe(0x7f);
    expect(dst[130]).toBe(128);
    expect(dst[131]).toBe(129);
    expect(dst[256]).toBe(254);
    expect(dst[257]).toBe(255);
    expect(dst[258]).toBe(0x2b);
    expect(dst[259]).toBe(0);
    expect(dst[260]).toBe(1);
  });

  it("short fill 3", () => {
    const src = new Uint8Array([1, 2, 3, 1, 2, 3, 1, 2, 3]);
    const dst = rlePack(src.length / 3, 3)(src);
    expect(dump(dst)).toBe("82 01 02 03");
  });

  it("short literal 3", () => {
    const src = new Uint8Array([1, 2, 3, 16, 17, 18, 32, 33, 34]);
    const dst = rlePack(src.length / 3, 3)(src);
    expect(dump(dst)).toBe("02 01 02 03 10 11 12 20 21 22");
  });

  it("short literal+fill 3", () => {
    const src = new Uint8Array([
      1, 2, 3, 16, 17, 18, 32, 33, 34, 32, 33, 34, 32, 33, 34,
    ]);
    const dst = rlePack(src.length / 3, 3)(src);
    expect(dump(dst)).toBe("01 01 02 03 10 11 12 82 20 21 22");
  });
});
