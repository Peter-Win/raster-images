import { dump } from "../../../utils";
import { CvtGrayAlpha16toGrayAlpha8 } from "../CvtGray16";

test("CvtGrayAlpha16toGrayAlpha8", () => {
  const src = new Uint16Array([
    0xaaaa, 1, 0xffff, 0x100, 0xffff, 0x2121, 0xffff, 0xeeff, 0x8011, 0xaaaa,
  ]);
  const width = 4;
  const dstOfs = 3;
  const dst = new Uint8Array(dstOfs + 2 * width + 2);
  dst.fill(0x55);
  CvtGrayAlpha16toGrayAlpha8.cvt(
    width,
    src.buffer,
    src.byteOffset + 2,
    dst.buffer,
    dst.byteOffset + dstOfs
  );
  expect(dump(dst)).toBe("55 55 55 00 FF 01 FF 21 FF EE 80 55 55");
});
