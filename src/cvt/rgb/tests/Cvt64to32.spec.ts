import { dump } from "../../../utils";
import { Cvt64to32 } from "../Cvt64to32";

test("Cvt64to32", () => {
  const width = 3;
  const src = [
    1, 2, 3, 0xffff, 0xefee, 0xdfdd, 0x8010, 0xcfcc, 0xbfbb, 0xafaa, 0xe321,
    0x8f88, 0x7f77, 0x6f66, 0x4321, 0,
  ];
  const srcBuf = new Uint16Array(src);
  const dstPixelSamples = 4;
  const dstOfs = 2;
  const dstBuf = new Uint8Array(dstOfs + width * dstPixelSamples + 2);
  dstBuf.fill(0x77);
  Cvt64to32.cvt(
    width,
    srcBuf.buffer,
    srcBuf.byteOffset + 3 * 2,
    dstBuf.buffer,
    dstBuf.byteOffset + dstOfs
  );
  expect(dump(dstBuf)).toBe("77 77 FF EF DF 80 CF BF AF E3 8F 7F 6F 43 77 77");
});
