import { onStreamFromGallery } from "../../tests/streamFromGallery";

describe("NodeJSFile", () => {
  it("read", async () => {
    await onStreamFromGallery("B5G5R5.bmp", async (stream) => {
      const buf1 = new Uint8Array(2);
      await stream.readBuffer(buf1, 2);
      expect(Array.from(buf1)).toEqual([0x42, 0x4d]);
      const buf2 = await stream.read(4);
      expect(Array.from(buf2)).toEqual([0xa6, 0xad, 0, 0]);
      await stream.seek(14);
      const buf3 = await stream.read(8);
      expect(Array.from(buf3)).toEqual([0x28, 0, 0, 0, 0xc7, 0, 0, 0]);
    });
  });
});
