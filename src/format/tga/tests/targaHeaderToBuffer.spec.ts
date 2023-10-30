import { dump } from "../../../utils";
import {
  TargaImageType,
  makeTargaImageDescriptor,
  targaHeaderToBuffer,
} from "../TargaHeader";

describe("targaHeaderToBuffer", () => {
  it("rle32", () => {
    const buf = targaHeaderToBuffer({
      idLength: 0,
      colorMapType: 0,
      imageType: TargaImageType.rleTrueColor,
      colorMapStart: 0,
      colorMapLength: 0,
      colorItemSize: 0,
      x0: 0,
      y0: 0,

      width: 333,
      height: 127,
      depth: 32,
      imageDescriptor: makeTargaImageDescriptor(8, false),
    });
    // from BGR32-RLE.tga
    expect(dump(buf)).toBe(
      "00 00 0A 00 00 00 00 00 00 00 00 00 4D 01 7F 00 20 08"
    );
  });

  it("bgr32", () => {
    const buf = targaHeaderToBuffer({
      idLength: 0,
      colorMapType: 0,
      imageType: TargaImageType.uncompressedTrueColor,
      colorMapStart: 0,
      colorMapLength: 0,
      colorItemSize: 0,
      x0: 0,
      y0: 72,

      width: 97,
      height: 72,
      depth: 32,
      imageDescriptor: makeTargaImageDescriptor(8, true),
    });
    expect(dump(buf)).toBe(
      "00 00 02 00 00 00 00 00 00 00 48 00 61 00 48 00 20 28"
    );
  });
});
