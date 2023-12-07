import { dump } from "../../../../utils";
import { getPngTimeFromBuffer, writePngTimeToBuffer } from "../PngTime";

test("getPngTimeFromBuffer", () => {
  // from R8G8B8.png = 2011-01-22 14:58:15
  const buf = new Uint8Array([0x07, 0xdb, 0x01, 0x16, 0x0e, 0x3a, 0x0f]);
  const t = getPngTimeFromBuffer(buf);
  expect(t).toEqual({
    year: 2011,
    month: 1,
    day: 22,
    hour: 14,
    minute: 58,
    second: 15,
  });
});

test("writePngTimeToBuffer", () => {
  // see above getPngTimeFromBuffer
  const buf = writePngTimeToBuffer({
    year: 2011,
    month: 1,
    day: 22,
    hour: 14,
    minute: 58,
    second: 15,
  });
  expect(dump(buf)).toBe("07 DB 01 16 0E 3A 0F");
});
