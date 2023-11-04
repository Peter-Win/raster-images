import { BufferStream } from "../../../stream";
import { bytesToUtf8, dump, subBuffer, utf8ToBytes } from "../../../utils";
import { readTargaFooter, writeTargaFooter } from "../TargaFooter";

describe("readTargaFooter", () => {
  it("short file", async () => {
    const buf = new Uint8Array(10);
    const stream = new BufferStream(buf);
    const footer = await readTargaFooter(stream);
    expect(footer).toBeUndefined();
  });
  it("no footer", async () => {
    const buf = new Uint8Array(100);
    const stream = new BufferStream(buf);
    const footer = await readTargaFooter(stream);
    expect(footer).toBeUndefined();
  });
  it("success", async () => {
    const buf = utf8ToBytes("123412341234TRUEVISION-XFILE.\0");
    const dv = new DataView(buf.buffer, buf.byteOffset);
    dv.setUint32(4, 123, true);
    dv.setUint32(8, 345, true);
    const stream = new BufferStream(buf);
    const footer = await readTargaFooter(stream);
    expect(footer).toEqual({
      extensionAreaOffset: 123,
      developerDirectoryOffset: 345,
    });
  });
});

test("writeTargaFooter", async () => {
  const buf = new Uint8Array(100);
  buf.fill(0xaa);
  const stream = new BufferStream(buf, { size: 0 });
  await writeTargaFooter(stream, {
    extensionAreaOffset: 0x1234,
    developerDirectoryOffset: 0x5678,
  });
  expect(dump(buf.slice(0, 10))).toBe("34 12 00 00 78 56 00 00 54 52");
  expect(bytesToUtf8(subBuffer(buf, 8, 18))).toBe("TRUEVISION-XFILE.\0");
});
