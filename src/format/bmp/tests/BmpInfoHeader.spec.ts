import {
  BmpCompression,
  BmpInfoHeader,
  bmpInfoHeaderSize,
  readBmpInfoHeader,
  writeBmpInfoHeader,
} from "../BmpInfoHeader";

const hdB5G5R5: number[] = [
  [0x28, 0, 0, 0], // biSize
  [0xc7, 0, 0, 0], // biWidth
  [0x6f, 0, 0, 0], // biHeight
  [1, 0], // biPlanes
  [0x10, 0], // biBitCount
  [0, 0, 0, 0], // biCompression
  [0, 0, 0, 0], // biSizeImage
  [0, 0, 0, 0], // biXPelsPerMeter
  [0, 0, 0, 0], // biYPelsPerMeter
  [0, 0, 0, 0], // biClrUsed
  [0, 0, 0, 0], // biClrImportant
].flatMap((n) => n);

describe("readBmpInfoHeader", () => {
  it("B5G5R5", () => {
    const buf = new Uint8Array(hdB5G5R5);
    expect(hdB5G5R5.length).toBe(bmpInfoHeaderSize);
    expect(buf.byteLength).toBe(bmpInfoHeaderSize);
    const hd = readBmpInfoHeader(buf.buffer, buf.byteOffset);
    expect(hd).toEqual({
      biSize: bmpInfoHeaderSize,
      biWidth: 0xc7,
      biHeight: 0x6f,
      biPlanes: 1,
      biBitCount: 16,
      biCompression: BmpCompression.RGB,
      biSizeImage: 0,
      biXPelsPerMeter: 0,
      biYPelsPerMeter: 0,
      biClrUsed: 0,
      biClrImportant: 0,
    } as BmpInfoHeader);
  });
});

describe("writeBmpInfoHeader", () => {
  it("B5G5R5", () => {
    const hd: BmpInfoHeader = {
      biSize: bmpInfoHeaderSize,
      biWidth: 0xc7,
      biHeight: 0x6f,
      biPlanes: 1,
      biBitCount: 16,
      biCompression: BmpCompression.RGB,
      biSizeImage: 0,
      biXPelsPerMeter: 0,
      biYPelsPerMeter: 0,
      biClrUsed: 0,
      biClrImportant: 0,
    };
    const buf = new Uint8Array(bmpInfoHeaderSize);
    writeBmpInfoHeader(hd, buf.buffer, buf.byteOffset);
    expect(Array.from(buf).slice(0, bmpInfoHeaderSize)).toEqual(hdB5G5R5);
  });
});
