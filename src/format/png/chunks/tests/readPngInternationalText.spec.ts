import { onStreamFromGallery } from "../../../../tests/streamFromGallery";
import { FormatPng } from "../../FormatPng";
import { readPngChunkRest } from "../../PngChunkRef";
import { PngText, readPngInternationalText } from "../PngText";

describe("readPngInternationalText", () => {
  it("rgb-inter.png", async () => {
    await onStreamFromGallery("rgb-inter.png", async (stream) => {
      const format = await FormatPng.create(stream);
      expect(format.frames.length).toBe(1);
      const frame = format.frames[0]!;
      const itxtChunk = frame.chunks.find(({ type }) => type === "iTXt");
      expect(itxtChunk).toBeDefined();
      const [data] = await readPngChunkRest(stream, itxtChunk!, true);
      const txtInfo: PngText = readPngInternationalText(data);
      expect(txtInfo.keyword).toBe("XML:com.adobe.xmp");
      expect(txtInfo.text.slice(0, 25)).toBe('<?xpacket begin="﻿" id="W');
      expect(txtInfo.language).toBe("");
      expect(txtInfo.compressionFlag).toBe(0);
      expect(txtInfo.translatedKeyword).toBe("");
    });
  });
});
