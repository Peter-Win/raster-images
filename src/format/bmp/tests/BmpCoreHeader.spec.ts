import { BufferStream } from "../../../stream";
import {
  BmpCoreHeader,
  readBmpCoreHeader,
  bmpCoreHeaderSize,
  writeBmpCoreHeader,
} from "../BmpCoreHeader";

const example: number[] = [0x0c, 0, 0, 0, 0x78, 0, 0x66, 0, 1, 0, 8, 0];

describe("BmpCoreHeader", () => {
  it("readBmpCoreHeader", async () => {
    const buf = new Uint8Array(example);
    const stream = new BufferStream(buf);
    const hd = await readBmpCoreHeader(stream);
    expect(hd).toEqual({
      bcSize: 12,
      bcWidth: 120,
      bcHeight: 102,
      bcPlanes: 1,
      bcBitCount: 8,
    } as BmpCoreHeader);
  });

  it("writeBmpCoreHeader", async () => {
    const hd: BmpCoreHeader = {
      bcSize: 12,
      bcWidth: 120,
      bcHeight: 102,
      bcPlanes: 1,
      bcBitCount: 8,
    };
    const buf = new Uint8Array(bmpCoreHeaderSize);

    const stream = new BufferStream(buf, { size: 0 });
    await writeBmpCoreHeader(hd, stream);
    expect(Array.from(buf)).toEqual(example);
  });
});
