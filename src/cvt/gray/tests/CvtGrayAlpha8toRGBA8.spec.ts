import { CvtGrayAlpha8toRGBA8 } from "../CvtGray8toRGB8";
import { dump } from "../../../utils";

test("CvtGrayAlpha8toRGBA8", () => {
  const dstPixelSize = 4;
  const width = 5;
  //            xx    xx    xx |   0    |     1     |    2      |     3     |    4      |  xx    xx
  const src = [
    0x55, 0x55, 0x55, 0, 0xff, 0x80, 0xff, 0xff, 0xff, 0xff, 0x80, 0xfe, 0x10,
    0xaa, 0xaa,
  ];
  const srcBuf = new Uint8Array(src);
  const dstOfs = 2;
  const dstBuf = new Uint8Array(dstOfs + width * dstPixelSize + 1);
  dstBuf.fill(0x77);
  CvtGrayAlpha8toRGBA8.cvt(
    width,
    srcBuf.buffer,
    srcBuf.byteOffset + 3,
    dstBuf.buffer,
    dstBuf.byteOffset + dstOfs
  );
  expect(dump(dstBuf)).toBe(
    "77 77 00 00 00 FF 80 80 80 FF FF FF FF FF FF FF FF 80 FE FE FE 10 77"
  );
});
