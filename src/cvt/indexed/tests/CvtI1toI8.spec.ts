import { dump } from "../../../utils";
import { CvtI1toI8 } from "../CvtIndexedToIndexedExt";

test("CvtI1toI8", () => {
  // 1010 0101 1100 100x
  const src = new Uint8Array([0xff, 0x00, 0xa5, 0xc9]);
  const width = 15;
  const dstOfs = 3;
  const dst = new Uint8Array(dstOfs + width + 2);
  dst.fill(0x55);
  CvtI1toI8.cvt(
    width,
    src.buffer,
    src.byteOffset + 2,
    dst.buffer,
    dst.byteOffset + dstOfs
  );
  //                    |     A     |     5     |     C     |   100x
  const need = "55 55 55 01 00 01 00 00 01 00 01 01 01 00 00 01 00 00 55 55";
  expect(dump(dst)).toBe(need);
});
