import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { checkPngSignature } from "../checkPngSignature";
import { readPngChunkRef, PngChunkRef } from "../PngChunkRef";

test("PngChunkRef", async () => {
  await onStreamFromGallery("I8-PS.png", async (stream) => {
    expect(await checkPngSignature(stream)).toBe(true);
    const chunk1: PngChunkRef = await readPngChunkRef(stream);
    expect(chunk1).toEqual({
      type: "IHDR",
      length: 13,
      dataPosition: 16,
      nextChunkPosition: 33,
    });
    await stream.seek(chunk1.nextChunkPosition);

    const chunk2: PngChunkRef = await readPngChunkRef(stream);
    expect(chunk2).toEqual({
      type: "pHYs",
      length: 9,
      dataPosition: 41,
      nextChunkPosition: 54,
    });
    await stream.seek(chunk2.nextChunkPosition);

    const chunk3: PngChunkRef = await readPngChunkRef(stream);
    expect(chunk3).toEqual({
      type: "iCCP",
      length: 2637,
      dataPosition: 62,
      nextChunkPosition: 2703,
    });
    await stream.seek(chunk3.nextChunkPosition);

    const chunk4: PngChunkRef = await readPngChunkRef(stream);
    expect(chunk4).toEqual({
      type: "cHRM",
      length: 32,
      dataPosition: 2711,
      nextChunkPosition: 2747,
    });
    await stream.seek(chunk4.nextChunkPosition);

    const chunk5: PngChunkRef = await readPngChunkRef(stream);
    expect(chunk5).toEqual({
      type: "PLTE",
      length: 768,
      dataPosition: 2755,
      nextChunkPosition: 3527,
    });
    await stream.seek(chunk5.nextChunkPosition);

    const chunk6: PngChunkRef = await readPngChunkRef(stream);
    expect(chunk6).toEqual({
      type: "tRNS",
      length: 256,
      dataPosition: 3535,
      nextChunkPosition: 3795,
    });
    await stream.seek(chunk6.nextChunkPosition);

    const chunk7: PngChunkRef = await readPngChunkRef(stream);
    expect(chunk7).toEqual({
      type: "IDAT",
      length: 21606,
      dataPosition: 3803,
      nextChunkPosition: 25413,
    });
    await stream.seek(chunk7.nextChunkPosition);

    const chunk8: PngChunkRef = await readPngChunkRef(stream);
    expect(chunk8).toEqual({
      type: "IEND",
      length: 0,
      dataPosition: 25421,
      nextChunkPosition: 25425,
    });
  });
});
