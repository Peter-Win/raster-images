import { SurfaceStd } from "../../../Surface";
import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { SurfaceReader } from "../../../transfer/SurfaceReader";
import { dumpA } from "../../../utils";
import { FormatGif } from "../FormatGif";

describe("FrameGif", () => {
  it("I8", async () => {
    await onStreamFromGallery("I8.gif", async (stream) => {
      const fmt = await FormatGif.create(stream);
      expect(fmt.frames.length).toBe(1);
      const frame = fmt.frames[0]!;
      expect(frame.type).toBe("frame");
      expect(frame.info.size.toString()).toBe("(303, 133)");
      expect(frame.info.fmt.signature).toBe("I8");
      expect(frame.info.fmt.palette?.length).toBe(256);

      const img = new SurfaceStd(frame.info);
      const reader = new SurfaceReader(img);
      await frame.read(reader);

      const getPixelHex = (x: number, y: number): string => {
        const offset = img.getRowOffset(y) + x;
        const pix = img.data[offset]!;
        const color = img.info.fmt.palette![pix]!;
        return dumpA(color);
      };
      expect(getPixelHex(0, 0)).toBe("78 A6 04 FF");
      expect(getPixelHex(302, 0)).toBe("64 C4 04 FF");
      expect(getPixelHex(0, 132)).toBe("5C AC 04 FF");
      expect(getPixelHex(302, 132)).toBe("69 8E 04 FF");
      expect(getPixelHex(60, 110)).toBe("04 04 FC FF"); // red
      expect(getPixelHex(60, 110)).toBe("0C F4 04 FF"); // green
    });
  });
});
