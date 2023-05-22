// https://learn.microsoft.com/en-us/windows/win32/api/wingdi/ns-wingdi-bitmapfileheader
// WORD  bfType;         2  +0
// DWORD bfSize;         4  +2
// WORD  bfReserved1;    2  +6
// WORD  bfReserved2;    2  +8
// DWORD bfOffBits;      4  +10
//                          +14

export const bmpFileHeaderSize = 14;
export const bmpSignature = 0x4d42;

export interface BmpFileHeader {
  bfType?: number; // not need for write
  bfSize: number;
  bfOffBits: number;
}

export const readBmpFileHeader = (
  buffer: ArrayBuffer,
  offset: number
): BmpFileHeader => {
  const dv = new DataView(buffer, offset);
  return {
    bfType: dv.getUint16(0, true),
    bfSize: dv.getUint32(2, true),
    bfOffBits: dv.getUint32(10, true),
  };
};

export const writeBmpFileHeader = (
  hd: BmpFileHeader,
  buffer: ArrayBuffer,
  offset: number
): void => {
  const dv = new DataView(buffer, offset);
  dv.setUint16(0, 0x4d42, true);
  dv.setUint32(2, hd.bfSize, true);
  dv.setUint32(6, 0);
  dv.setUint16(10, hd.bfOffBits, true);
};
