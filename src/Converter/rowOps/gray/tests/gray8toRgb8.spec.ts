import { dump, subBuffer } from "../../../../utils";
import { gray8toRgb8, gray8toRgba8 } from "../gray8toRgb8";

describe("gray8toRgb8", () => {
  const srcGray = new Uint8Array([0, 1, 0x11, 0x80, 0xab, 0xff]);
  const needRgb = "00 00 00 01 01 01 11 11 11 80 80 80 AB AB AB FF FF FF";
  it("full buffer", () => {
    const dstRgb = new Uint8Array(srcGray.length * 3);
    gray8toRgb8(srcGray.length, srcGray, dstRgb);
    expect(dump(dstRgb)).toBe(needRgb);
  });
  it("partial", () => {
    const dstRgb = new Uint8Array((srcGray.length - 1) * 3);
    dstRgb.fill(0x55);
    // skip 2 pixels in src gray buffer and 1 pixel in dst rgb buffer
    gray8toRgb8(3, subBuffer(srcGray, 2), subBuffer(dstRgb, 1 * 3));
    expect(dump(dstRgb)).toBe("55 55 55 11 11 11 80 80 80 AB AB AB 55 55 55");
  });
});

test("gray8toRgba8", () => {
  const srcGray = new Uint8Array([0, 1, 2, 0xfe, 0xff]);
  const width = srcGray.length;
  const dst = new Uint8Array(width * 4);
  gray8toRgba8(width, srcGray, dst);
  expect(dump(dst)).toBe(
    "00 00 00 FF 01 01 01 FF 02 02 02 FF FE FE FE FF FF FF FF FF"
  );
});
