import { dump } from "../../../utils";
import { Cvt48to24 } from "../Cvt48to24";

test("Cvt48to24", () => {
  const width = 3;
  //                                          |               |                  |                    |
  const src = new Uint16Array([
    0x5555, 0xaaaa, 0xfedc, 0x80, 1, 0x100, 0xefff, 0, 0x10, 0x100, 0x1000,
    0xaaaa,
  ]);
  const dstOfs = 3;
  const dst = new Uint8Array(dstOfs + width * 3 + 2);
  dst.fill(0x33);

  Cvt48to24.cvt(
    width,
    src.buffer,
    src.byteOffset + 4,
    dst.buffer,
    dst.byteOffset + dstOfs
  );
  expect(dump(dst)).toBe("33 33 33 FE 00 00 01 EF 00 00 01 10 33 33");
});
