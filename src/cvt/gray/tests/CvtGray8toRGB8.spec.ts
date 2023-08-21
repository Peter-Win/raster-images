import { dump } from "../../../utils";
import { CvtGray8toRGB8 } from "../CvtGray8toRGB8";

describe("CvtGray8toRGB8", () => {
  const srcGray = new Uint8Array([0, 1, 0x11, 0x80, 0xab, 0xff]);
  const needRgb = "00 00 00 01 01 01 11 11 11 80 80 80 AB AB AB FF FF FF";
  it("full buffer", () => {
    const dstRgb = new Uint8Array(srcGray.length * 3);
    CvtGray8toRGB8.cvt(srcGray.length, srcGray.buffer, 0, dstRgb.buffer, 0);
    expect(dump(dstRgb)).toBe(needRgb);
  });
  it("partial", () => {
    const dstRgb = new Uint8Array((srcGray.length - 1) * 3);
    dstRgb.fill(0x55);
    // skip 2 pixels in src gray buffer and 1 pixel in dst rgb buffer
    CvtGray8toRGB8.cvt(3, srcGray.buffer, 2, dstRgb.buffer, 1 * 3);
    expect(dump(dstRgb)).toBe("55 55 55 11 11 11 80 80 80 AB AB AB 55 55 55");
  });
});
