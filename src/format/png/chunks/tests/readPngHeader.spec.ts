import { onStreamFromGallery } from "../../../../tests/streamFromGallery";
import { readPngChunkRef, readPngChunkRest } from "../../PngChunkRef";
import { checkPngSignature } from "../../checkPngSignature";
import { readPngHeader } from "../PngHeader";

describe("readPngHeader", () => {
  it("B&W.png", async () => {
    await onStreamFromGallery("B&W.png", async (stream) => {
      expect(await checkPngSignature(stream)).toBe(true);
      const chunk1 = await readPngChunkRef(stream);
      expect(chunk1.type).toBe("IHDR");
      const [data] = await readPngChunkRest(stream, chunk1, false);
      const info = readPngHeader(data);
      expect(info.size.toString()).toBe("(199, 89)");
      expect(info.fmt.signature).toBe("G1");
      expect(info.vars?.interlaced).toBe(0);
    });
  });
  it("B&W-Interlaced.png", async () => {
    await onStreamFromGallery("B&W-Interlaced.png", async (stream) => {
      expect(await checkPngSignature(stream)).toBe(true);
      const chunk1 = await readPngChunkRef(stream);
      expect(chunk1.type).toBe("IHDR");
      const [data] = await readPngChunkRest(stream, chunk1, false);
      const info = readPngHeader(data);
      expect(info.size.toString()).toBe("(199, 89)");
      expect(info.fmt.signature).toBe("G1");
      expect(info.vars?.interlaced).toBe(1);
    });
  });
  it("I4.png", async () => {
    await onStreamFromGallery("I4.png", async (stream) => {
      expect(await checkPngSignature(stream)).toBe(true);
      const chunk1 = await readPngChunkRef(stream);
      expect(chunk1.type).toBe("IHDR");
      const [data] = await readPngChunkRest(stream, chunk1, false);
      const info = readPngHeader(data);
      expect(info.size.toString()).toBe("(223, 125)");
      expect(info.fmt.signature).toBe("I4");
      expect(info.vars?.interlaced).toBe(0);
    });
  });
  it("G8-Inerlaced.png", async () => {
    await onStreamFromGallery("G8-Inerlaced.png", async (stream) => {
      expect(await checkPngSignature(stream)).toBe(true);
      const chunk1 = await readPngChunkRef(stream);
      expect(chunk1.type).toBe("IHDR");
      const [data] = await readPngChunkRest(stream, chunk1, false);
      const info = readPngHeader(data);
      expect(info.size.toString()).toBe("(303, 133)");
      expect(info.fmt.signature).toBe("G8");
      expect(info.vars?.interlaced).toBe(1);
    });
  });
  it("G8A8.png", async () => {
    await onStreamFromGallery("G8A8.png", async (stream) => {
      expect(await checkPngSignature(stream)).toBe(true);
      const chunk1 = await readPngChunkRef(stream);
      expect(chunk1.type).toBe("IHDR");
      const [data] = await readPngChunkRest(stream, chunk1, false);
      const info = readPngHeader(data);
      expect(info.size.toString()).toBe("(199, 89)");
      expect(info.fmt.signature).toBe("G8A8");
      expect(info.vars?.interlaced).toBe(0);
    });
  });
  it("G16A16-Interlaced.png", async () => {
    await onStreamFromGallery("G16A16-Interlaced.png", async (stream) => {
      expect(await checkPngSignature(stream)).toBe(true);
      const chunk1 = await readPngChunkRef(stream);
      expect(chunk1.type).toBe("IHDR");
      const [data] = await readPngChunkRest(stream, chunk1, false);
      const info = readPngHeader(data);
      expect(info.size.toString()).toBe("(199, 89)");
      expect(info.fmt.signature).toBe("G16A16");
      expect(info.vars?.interlaced).toBe(1);
    });
  });
  it("R8G8B8.png", async () => {
    await onStreamFromGallery("R8G8B8.png", async (stream) => {
      expect(await checkPngSignature(stream)).toBe(true);
      const chunk1 = await readPngChunkRef(stream);
      expect(chunk1.type).toBe("IHDR");
      const [data] = await readPngChunkRest(stream, chunk1, false);
      const info = readPngHeader(data);
      expect(info.size.toString()).toBe("(259, 127)");
      expect(info.fmt.signature).toBe("R8G8B8");
      expect(info.vars?.interlaced).toBe(0);
    });
  });
  it("R8G8B8A8.png", async () => {
    await onStreamFromGallery("R8G8B8A8.png", async (stream) => {
      expect(await checkPngSignature(stream)).toBe(true);
      const chunk1 = await readPngChunkRef(stream);
      expect(chunk1.type).toBe("IHDR");
      const [data] = await readPngChunkRest(stream, chunk1, false);
      const info = readPngHeader(data);
      expect(info.size.toString()).toBe("(99, 89)");
      expect(info.fmt.signature).toBe("R8G8B8A8");
      expect(info.vars?.interlaced).toBe(0);
    });
  });
  it("R16G16B16A16.png", async () => {
    await onStreamFromGallery("R16G16B16A16.png", async (stream) => {
      expect(await checkPngSignature(stream)).toBe(true);
      const chunk1 = await readPngChunkRef(stream);
      expect(chunk1.type).toBe("IHDR");
      const [data] = await readPngChunkRest(stream, chunk1, false);
      const info = readPngHeader(data);
      expect(info.size.toString()).toBe("(333, 127)");
      expect(info.fmt.signature).toBe("R16G16B16A16");
      expect(info.vars?.interlaced).toBe(0);
    });
  });
});
