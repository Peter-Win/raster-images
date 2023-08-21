import { BufferStream, readByte } from "../../../stream";
import { readGifDataAsText, skipGifData } from "../skipGifData";

describe("skipGifData", () => {
  it("skipGifData", async () => {
    const arr = [255, 255, 255, 4, 65, 66, 67, 68, 1, 69, 0, 70];
    const buf = new Uint8Array(arr);
    const stream = new BufferStream(buf);
    await stream.seek(3);
    await skipGifData(stream);
    const value = await readByte(stream);
    expect(value).toBe(70);
  });
});

test("readGifDataAsText", async () => {
  const arr = [255, 255, 255, 4, 65, 66, 67, 68, 2, 69, 70, 0, 71];
  const buf = new Uint8Array(arr);
  const stream = new BufferStream(buf);
  await stream.seek(3);
  const text = await readGifDataAsText(stream);
  expect(text).toBe("ABCDEF");
  expect(await readByte(stream)).toBe(71);
});
