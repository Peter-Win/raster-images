import { dump } from "../../../utils";
import { CvtGray1to24 } from "../CvtGray1toRGB";

describe("CvtGray1to24", () => {
  it("CvtGray1to24", () => {
    const width = 11;
    // xxxx xxxx xxxx xxxx 1010 0101 111x xxxx
    const src = new Uint8Array([0x88, 0x88, 0xa5, 0xf0]);
    const dst = new Uint8Array(3 + width * 3 + 2);
    dst.fill(0x55);
    CvtGray1to24.cvt(
      width,
      src.buffer,
      src.byteOffset + 2,
      dst.buffer,
      dst.byteOffset + 3
    );
    const need =
      "55 55 55 FF FF FF 00 00 00 FF FF FF 00 00 00 00 00 00 FF FF FF 00 00 00 FF FF FF FF FF FF FF FF FF FF FF FF 55 55";
    expect(dump(dst)).toBe(need);
  });
});
