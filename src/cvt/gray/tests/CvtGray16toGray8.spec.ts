import { dump } from "../../../utils";
import { CvtGray16toGray8 } from "../CvtGray16";

test("CvtGray16toGray8", () => {
  const width = 5;
  const srcBuf = new Uint16Array([
    0x5555, 0x5555, 0, 0x80, 0x1fe, 0x800, 0xfeee, 0xaaaa,
  ]);
  const dstOfs = 3;
  const dstBuf = new Uint8Array(dstOfs + width + 2);
  dstBuf.fill(0x33);
  CvtGray16toGray8.cvt(
    width,
    srcBuf.buffer,
    srcBuf.byteOffset + 4,
    dstBuf.buffer,
    dstBuf.byteOffset + dstOfs
  );
  expect(dump(dstBuf)).toBe("33 33 33 00 00 01 08 FE 33 33");
});
