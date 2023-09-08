import { onStreamFromGallery } from "../../../../tests/streamFromGallery";
import { FormatPng } from "../../FormatPng";
import { readPngChunkRest } from "../../PngChunkRef";
import { PngText, readPngText } from "../PngText";

describe("readPngText", () => {
  it("rgb-inter.png", async () => {
    await onStreamFromGallery("rgb-inter.png", async (stream) => {
      const format = await FormatPng.create(stream);
      expect(format.frames.length).toBe(1);
      const frame = format.frames[0]!;
      const txtChunk = frame.chunks.find(({ type }) => type === "tEXt");
      expect(txtChunk).toBeDefined();
      const [data] = await readPngChunkRest(stream, txtChunk!, true);
      const txtInfo: PngText = readPngText(data);
      expect(txtInfo.keyword).toBe("Comment");
      expect(txtInfo.text).toBe("Hello, world!");
    });
  });
});
