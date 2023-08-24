import { dump } from "../../../utils";
import { CvtGray1toGray8 } from "../CvtGray1toGray";

describe("CvtGray1toGray8", () => {
  it("simple", () => {
    const width = 14;
    // 1 1 1 1 0 0 0 0  1 0 1 0 0 1 | 0 1
    const src = new Uint8Array([0xf0, 0xa5]);
    const dst = new Uint8Array(width);
    dst.fill(0x88);
    CvtGray1toGray8.cvt(
      width,
      src.buffer,
      src.byteOffset,
      dst.buffer,
      dst.byteOffset
    );
    expect(dump(dst)).toBe("FF FF FF FF 00 00 00 00 FF 00 FF 00 00 FF");
  });

  it("with offset", () => {
    const width = 6;
    // 1 0 1 0 0 1 | 0 1
    const src = new Uint8Array([0xff, 0xf0, 0xa5, 0]);
    const dst = new Uint8Array(3 + width + 2);
    dst.fill(0x88);
    CvtGray1toGray8.cvt(
      width,
      src.buffer,
      src.byteOffset + 2,
      dst.buffer,
      dst.byteOffset + 3
    );
    expect(dump(dst)).toBe("88 88 88 FF 00 FF 00 00 FF 88 88");
  });
});
