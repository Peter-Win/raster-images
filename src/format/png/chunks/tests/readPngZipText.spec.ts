import { onStreamFromGallery } from "../../../../tests/streamFromGallery";
import { FormatPng } from "../../FormatPng";
import { readPngChunkRest } from "../../PngChunkRef";
import { PngText, readPngZipText } from "../PngText";

// Exif & IPTC не являются текстовыми данными. Но они хранятся в текстовых полях
// Для этого бинарные данные переводятся в текст,
// который содержит заголовок, размер и данные, закодированные в виде hex и периодически прерываются сиволами конца строки

describe("readPngZipText", () => {
  it("rgb-inter.png", async () => {
    await onStreamFromGallery("rgb-inter.png", async (stream) => {
      const format = await FormatPng.create(stream);
      expect(format.frames.length).toBe(1);
      const frame = format.frames[0]!;
      const txtChunks = frame.chunks.filter(({ type }) => type === "zTXt");
      expect(txtChunks.length).toBe(2);

      const [data0] = await readPngChunkRest(stream, txtChunks[0]!, true);
      const info0: PngText = readPngZipText(data0);
      expect(info0.keyword).toBe("Raw profile type exif");
      // exif
      // 9044 - size
      // 45786966 = Exif
      expect(info0.text.slice(0, 23)).toBe("\nexif\n    9044\n45786966");

      const [data1] = await readPngChunkRest(stream, txtChunks[1]!, true);
      const info1: PngText = readPngZipText(data1);
      expect(info1.keyword).toBe("Raw profile type iptc");
      // iptc
      // 158
      // 3842494d = 8BIM
      expect(info1.text.slice(0, 23)).toBe("\niptc\n     158\n3842494d");
    });
  });
});
