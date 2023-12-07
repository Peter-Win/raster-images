import { surfaceConverter } from "../../../../Converter/surfaceConverter";
import { loadImageByName } from "../../../../loadImage";
import { getTestFile } from "../../../../tests/getTestFile";
import { onStreamFromGallery } from "../../../../tests/streamFromGallery";
import { savePng } from "../savePng";
import { NodeJSFile } from "../../../../stream/NodeJSFile";
import { streamLock } from "../../../../stream";
import { dump } from "../../../../utils";

test("IHDR", async () => {
  await onStreamFromGallery("R8G8B8.png", async (srcStream) => {
    const size = 0x21; // size of begin of PNG file with IHDR chunk
    const [srcBuf, img] = await streamLock(srcStream, async () => [
      await srcStream.read(size),
      await loadImageByName(srcStream),
    ]);
    const converter = surfaceConverter(img);
    const reader = await converter.getRowsReader();
    const dstStream = await getTestFile(__dirname, "ihdr.png", "w");
    await savePng(reader, dstStream, {});
    await streamLock(new NodeJSFile(dstStream.name, "r"), async (stream) => {
      const dstBuf = await stream.read(size);
      expect(dump(srcBuf)).toBe(dump(dstBuf));
    });
  });
});
