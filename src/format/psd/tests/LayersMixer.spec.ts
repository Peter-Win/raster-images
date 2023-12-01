import { readImage } from "../../../Converter";
import { surfaceConverter } from "../../../Converter/surfaceConverter";
import { SurfaceStd } from "../../../Surface";
import { Point } from "../../../math";
import { BufferStream } from "../../../stream";
import { dump } from "../../../utils";
import { LayersMixer } from "../LayersMixer";
import { PsdCompression } from "../PsdCompression";

describe("LayersMixer", () => {
  it("RGB with similar layers", async () => {
    // test image data: 4x2 pixels
    const width = 4;
    const height = 2;
    // red, orange, yellow, green, cyan,
    // blue, magenta, white, gray
    //    0  1  2  3  4  5  6  7
    // r FF FE 00 00 00 FA FF 7F
    // g 00 FE FD FC 00 00 FF 80
    // b 00 00 00 FC FB FA FF 81
    const psdImageData = new Uint8Array(
      [
        [0xff, 0xfe, 0x00, 0x00, 0x00, 0xfa, 0xff, 0x7f],
        [0x00, 0xfe, 0xfd, 0xfc, 0x00, 0x00, 0xff, 0x80],
        [0x00, 0x00, 0x00, 0xfc, 0xfb, 0xfa, 0xff, 0x81],
      ].flatMap((n) => n)
    );
    const stream = new BufferStream(psdImageData);
    const mixer = new LayersMixer(new Point(width, height), 8);
    await mixer.loadSimilarLayers(3, PsdCompression.None, stream);
    expect(mixer.layers.length).toBe(3);
    expect(mixer.layers[0]!.size.toString()).toBe("(4, 2)");
    expect(mixer.layers[0]!.info.fmt.signature).toBe("G8");

    const fillRow = mixer.getFillRow([0, 1, 2]);
    const dstImg = SurfaceStd.createSign(width, height, "R8G8B8");
    await readImage(surfaceConverter(dstImg), dstImg.info, fillRow);
    expect(dump(dstImg.getRowBuffer(0))).toBe(
      "FF 00 00 FE FE 00 00 FD 00 00 FC FC"
    );
    expect(dump(dstImg.getRowBuffer(1))).toBe(
      "00 00 FB FA 00 FA FF FF FF 7F 80 81"
    );
  });
});
