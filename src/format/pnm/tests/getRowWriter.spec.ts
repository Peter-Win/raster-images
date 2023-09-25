import { bytesToUtf8, dump } from "../../../utils";
import { negBytesFactory, plainBitmapRowWriter } from "../getRowWriter";

describe("getRowWriter", () => {
  describe("plainBitmapRowWriter", () => {
    it("single row", () => {
      const cvt = plainBitmapRowWriter(15, 70);
      const srcRow = new Uint8Array([0xa5, 0xc8]);
      const dstBuf = cvt(srcRow);
      const text = bytesToUtf8(dstBuf);
      //                |   A   |   5   |   C   | 8 (3 bits)
      expect(text).toBe("0 1 0 1 1 0 1 0 0 0 1 1 0 1 1\n");
    });
    it("splitted row", () => {
      const cvt = plainBitmapRowWriter(15, 10);
      const srcRow = new Uint8Array([0xa5, 0xc8]);
      const dstBuf = cvt(srcRow);
      const text = bytesToUtf8(dstBuf);
      //                 0123456789 0123456789 0123456789
      expect(text).toBe("0 1 0 1 1\n0 1 0 0 0\n1 1 0 1 1\n");
    });
  });

  it("negBytesFactory", () => {
    const cvt = negBytesFactory(30);
    const row = new Uint8Array([0x00, 0xf0, 0xaa, 0xc3]);
    expect(dump(cvt(row))).toBe("FF 0F 55 3C");
  });
});
