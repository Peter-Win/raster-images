import { dump } from "../../../utils";
import { CvtI4toI8 } from "../CvtIndexedToIndexedExt";

test("CvtI4toI8", () => {
  // 1010 0101 1100 100x
  const src = new Uint8Array([
    0x00, 0xff, 0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef, 0x0a,
  ]);
  const width = 17;
  const dstOfs = 3;
  const dst = new Uint8Array(dstOfs + width + 2);
  dst.fill(0x55);
  CvtI4toI8.cvt(
    width,
    src.buffer,
    src.byteOffset + 2,
    dst.buffer,
    dst.byteOffset + dstOfs
  );
  const need =
    "55 55 55 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F 00 55 55";
  expect(dump(dst)).toBe(need);
});
