import { createInfoSign } from "../../../../ImageInfo";
import { BufferStream } from "../../../../stream";
import { SurfaceStd } from "../../../../Surface";
import { bytesToUtf8, subBuffer } from "../../../../utils";
import { formatForSaveFromSurface } from "../../../FormatForSave";
import { savePnmFormat } from "../savePnmFormat";

test("savePnmFormat", async () => {
  const buf = new Uint8Array(1000);
  const stream = new BufferStream(buf, { size: 0 });
  const gray3x2pixels = new Uint8Array([0, 1, 2, 200, 201, 202]);
  const info = createInfoSign(3, 2, "G8", {
    dataType: "plain",
    comment: "Abcd",
  });
  const img = new SurfaceStd(info, gray3x2pixels);
  const fmt = formatForSaveFromSurface(img);
  await savePnmFormat(fmt, stream);
  const size = await stream.getSize();
  const text = bytesToUtf8(subBuffer(buf, 0, size));
  expect(text).toBe(`P2\n# Abcd\n3 2\n255\n0 1 2\n200 201 202\n`);
});
