import { dump, subBuffer } from "../../../../utils";
import { rgb48to24Fast } from "../rgb48to24";

test("rgb48to24", () => {
  const width = 3;
  //                        |               |                  |                    |
  const a = [
    0x5555, 0xaaaa, 0xfedc, 0x80, 1, 0x100, 0xefff, 0, 0x10, 0x100, 0x1000,
    0xaaaa,
  ];
  const src = new Uint16Array(a);
  const dstOfs = 3;
  const dst = new Uint8Array(dstOfs + width * 3 + 2);
  dst.fill(0x33);

  rgb48to24Fast(
    width,
    new Uint8Array(src.buffer, src.byteOffset + 4),
    subBuffer(dst, dstOfs)
  );
  expect(dump(dst)).toBe("33 33 33 FE 00 00 01 EF 00 00 01 10 33 33");
});
