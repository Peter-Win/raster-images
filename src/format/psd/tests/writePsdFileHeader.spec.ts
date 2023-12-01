import { BufferStream } from "../../../stream";
import { dump } from "../../../utils";
import {
  PsdColorMode,
  PsdFileHeader,
  writePsdFileHeader,
} from "../PsdFileHeader";

test("writePsdFileHeader", async () => {
  const buf = new Uint8Array(200);
  const stream = new BufferStream(buf, { size: 0 });
  const hd: PsdFileHeader = {
    width: 0x1234,
    height: 0x987,
    nChannels: 4,
    colorMode: PsdColorMode.CMYK,
    depth: 8,
  };
  await writePsdFileHeader(hd, stream);
  const size = await stream.getSize();
  expect(dump(buf.slice(0, size))).toBe(
    "38 42 50 53 00 01 00 00 00 00 00 00 00 04 00 00 09 87 00 00 12 34 00 08 00 04"
  );
});
