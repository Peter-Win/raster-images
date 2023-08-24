import { dump } from "../../../utils";
import { CvtGray1to32 } from "../CvtGray1toRGB";

test("CvtGray1to32", () => {
  const width = 9;
  // xxxx xxxx xxxx xxxx 1010 0101 1xxx xxxx
  const src = new Uint8Array([0x88, 0x88, 0xa5, 0xf0]);
  const dst = new Uint8Array(3 + width * 4 + 2);
  dst.fill(0x55);
  CvtGray1to32.cvt(
    width,
    src.buffer,
    src.byteOffset + 2,
    dst.buffer,
    dst.byteOffset + 3
  );
  //                    |                       A                       |                       5                       |
  //           |    x   |     1     |     0     |     1     |     0     |     0     |     1     |     0     |     1     |     1     |  x
  const need =
    "55 55 55 FF FF FF FF 00 00 00 FF FF FF FF FF 00 00 00 FF 00 00 00 FF FF FF FF FF 00 00 00 FF FF FF FF FF FF FF FF FF 55 55";
  expect(dump(dst)).toBe(need);
});
