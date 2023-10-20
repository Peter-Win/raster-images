import { dump, subBuffer } from "../../../../utils";
import { gray16toGray8, grayAlpha16toGrayAlpha8 } from "../gray16toGray8";

test("gray16toGray8", () => {
  const width = 5;
  const srcBuf = new Uint16Array([
    0x5555, 0x5555, 0, 0x80, 0x1fe, 0x800, 0xfeee, 0xaaaa,
  ]);
  const dstOfs = 3;
  const dstBuf = new Uint8Array(dstOfs + width + 2);
  dstBuf.fill(0x33);
  gray16toGray8(
    width,
    new Uint8Array(srcBuf.buffer, srcBuf.byteOffset + 4),
    subBuffer(dstBuf, dstOfs)
  );
  expect(dump(dstBuf)).toBe("33 33 33 00 00 01 08 FE 33 33");
});

test("grayAlpha16toGrayAlpha8", () => {
  const width = 4;
  const src = new Uint16Array([
    0, 0xfffe, 0x10, 0xfeee, 0x200, 0xfddd, 0x3000, 0xfc,
  ]);
  const dst = new Uint8Array(width * 2);
  grayAlpha16toGrayAlpha8(
    width,
    new Uint8Array(src.buffer, src.byteOffset),
    dst
  );
  expect(dump(dst)).toBe("00 FF 00 FE 02 FD 30 00");
});
