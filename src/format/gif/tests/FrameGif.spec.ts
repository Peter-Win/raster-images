import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { FormatGif } from "../FormatGif";
import { PaletteItem } from "../../../Palette";
import { loadImageByName, loadImageFromFrame } from "../../../loadImage";

describe("FrameGif", () => {
  /**
   * test for this rule:
   * 4. The output codes are of variable length, starting at <code size>+1 bits per
code, up to 12 bits per code. This defines a maximum code value of 4095
(0xFFF). Whenever the LZW code value would exceed the current code length, the
code length is increased by one. The packing/unpacking of these codes must then
be altered to reflect the new code length.
@see https://www.w3.org/Graphics/GIF/spec-gif89a.txt
   */
  it("cheese.gif", async () => {
    const srcName = "cheese.gif";
    const cmpName = "cheese.ppm";
    await onStreamFromGallery(srcName, async (stream) => {
      const fmt = await FormatGif.create(stream);
      expect(fmt.frames.length).toBe(1);
      const frame = fmt.frames[0]!;
      expect(frame.type).toBe("frame");
      expect(frame.info.size.toString()).toBe("(604, 518)");
      expect(frame.info.fmt.signature).toBe("I8");
      expect(frame.info.fmt.palette?.length).toBe(256);
      const palette = frame.info.fmt.palette!;
      const img = await loadImageFromFrame(frame);

      await onStreamFromGallery(cmpName, async (cmpStream) => {
        const cmpImg = await loadImageByName(cmpStream);
        const { size } = frame.info;
        for (let y = 0; y < size.y; y++) {
          const srcRow = img.getRowBuffer(y);
          const cmpRow = cmpImg.getRowBuffer(y);
          for (let x = 0; x < size.x; x++) {
            const srcIndex: number = srcRow[x]!;
            const srcColor: PaletteItem = palette[srcIndex]!;
            const cmpB = cmpRow[3 * x + 2];
            const cmpG = cmpRow[3 * x + 1];
            const cmpR = cmpRow[3 * x];
            expect(`${x},${y}: ${cmpR},${cmpG},${cmpB}`).toBe(
              `${x},${y}: ${srcColor[2]},${srcColor[1]},${srcColor[0]}`
            );
          }
        }
      });
    });
  }, 90000);

  it("I8.gif", async () => {
    const srcName = "I8.gif";
    const cmpName = "I8gif.ppm";
    await onStreamFromGallery(srcName, async (stream) => {
      const fmt = await FormatGif.create(stream);
      expect(fmt.frames.length).toBe(1);
      const frame = fmt.frames[0]!;
      expect(frame.type).toBe("frame");
      expect(frame.info.size.toString()).toBe("(303, 133)");
      expect(frame.info.fmt.signature).toBe("I8");
      expect(frame.info.fmt.palette?.length).toBe(256);
      const palette = frame.info.fmt.palette!;
      const img = await loadImageFromFrame(frame);

      await onStreamFromGallery(cmpName, async (cmpStream) => {
        const cmpImg = await loadImageByName(cmpStream);
        const { size } = frame.info;
        for (let y = 0; y < size.y; y++) {
          const srcRow = img.getRowBuffer(y);
          const cmpRow = cmpImg.getRowBuffer(y);
          for (let x = 0; x < size.x; x++) {
            const srcIndex: number = srcRow[x]!;
            const srcColor: PaletteItem = palette[srcIndex]!;
            const cmpB = cmpRow[3 * x + 2];
            const cmpG = cmpRow[3 * x + 1];
            const cmpR = cmpRow[3 * x];
            expect(`${x},${y}: ${cmpR},${cmpG},${cmpB}`).toBe(
              `${x},${y}: ${srcColor[2]},${srcColor[1]},${srcColor[0]}`
            );
          }
        }
      });
    });
  }, 90000);
});
