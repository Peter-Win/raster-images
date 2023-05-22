import { Palette } from "../Palette";
import { writePaletteToBuf } from "../writePalette";
import { dump } from "../../utils";

describe("writePaletteToBuf", () => {
  const pal: Palette = [
    [0, 0, 0, 254],
    [255, 1, 1, 255], // blue
    [2, 255, 2, 255], // green
    [3, 3, 255, 255], // red
    [255, 255, 255, 255], // white
  ];
  it("BGR", () => {
    const buf = new Uint8Array(pal.length * 3);
    writePaletteToBuf(pal, buf, {});
    expect(dump(buf)).toBe("00 00 00 FF 01 01 02 FF 02 03 03 FF FF FF FF");
  });
  it("RGB", () => {
    const buf = new Uint8Array(pal.length * 3);
    writePaletteToBuf(pal, buf, { rgb: true });
    expect(dump(buf)).toBe("00 00 00 01 01 FF 02 FF 02 FF 03 03 FF FF FF");
  });
  it("BGRA", () => {
    const buf = new Uint8Array(pal.length * 4);
    writePaletteToBuf(pal, buf, { dword: true });
    expect(dump(buf)).toBe(
      "00 00 00 FE FF 01 01 FF 02 FF 02 FF 03 03 FF FF FF FF FF FF"
    );
  });
  it("RGBA", () => {
    const buf = new Uint8Array(pal.length * 4);
    writePaletteToBuf(pal, buf, { rgb: true, dword: true });
    expect(dump(buf)).toBe(
      "00 00 00 FE 01 01 FF FF 02 FF 02 FF FF 03 03 FF FF FF FF FF"
    );
  });
  it("6 bits", () => {
    const buf = new Uint8Array(pal.length * 3);
    writePaletteToBuf(pal, buf, { bits6: true });
    expect(dump(buf)).toBe("00 00 00 3F 00 00 00 3F 00 00 00 3F 3F 3F 3F");
  });
});
