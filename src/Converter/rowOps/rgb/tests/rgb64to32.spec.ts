import { rgb64to32Fast } from "../rgb64to32";
import { dump, subBuffer } from "../../../../utils";

test("rgb64to32", () => {
  const width = 3;
  const src = [
    [1, 2, 3], // ignored
    [0xffff, 0xefee, 0xdfdd, 0x8010],
    [0xcfcc, 0xbfbb, 0xafaa, 0xe321],
    [0x8f88, 0x7f77, 0x6f66, 0x4321],
    [0], // ignored
  ];
  const srcBuf = new Uint16Array(src.flatMap((n) => n));
  const dstPixelSamples = 4;
  const dstOfs = 2;
  const dstBuf = new Uint8Array(dstOfs + width * dstPixelSamples + 2);
  dstBuf.fill(0x77);
  rgb64to32Fast(
    width,
    new Uint8Array(srcBuf.buffer, srcBuf.byteOffset + 3 * 2),
    subBuffer(dstBuf, dstOfs)
  );
  expect(dump(dstBuf)).toBe("77 77 FF EF DF 80 CF BF AF E3 8F 7F 6F 43 77 77");
});
