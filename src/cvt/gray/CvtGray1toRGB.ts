import { CvtDescriptorDirect } from "../CvtDescriptor";

export const CvtGray1to24: CvtDescriptorDirect = {
  loss: false,
  speed: 100,
  quality: 100,
  cvt: (
    width: number,
    srcBuf: ArrayBuffer,
    srcByteOffset: number,
    dstBuf: ArrayBuffer,
    dstByteOffset: number
  ) => {
    const src = new Uint8Array(srcBuf, srcByteOffset);
    const dst = new Uint8Array(dstBuf, dstByteOffset);
    let srcPos = 0;
    let mask = 0;
    let curByte = 0;
    let dstPos = 0;
    const dstEnd = width * 3;
    while (dstPos < dstEnd) {
      if (mask === 0) {
        mask = 0x80;
        curByte = src[srcPos++]!;
      }
      const g = curByte & mask ? 0xff : 0;
      dst[dstPos++] = g;
      dst[dstPos++] = g;
      dst[dstPos++] = g;
      mask >>= 1;
    }
  },
};

// G1 => RGBA or RGBX (R8G8B8A8 or B8G8R8A8 or R8G8B8X8 or B8G8R8X8)
export const CvtGray1to32: CvtDescriptorDirect = {
  loss: false,
  speed: 100,
  quality: 100,
  cvt: (
    width: number,
    srcBuf: ArrayBuffer,
    srcByteOffset: number,
    dstBuf: ArrayBuffer,
    dstByteOffset: number
  ) => {
    const src = new Uint8Array(srcBuf, srcByteOffset);
    const dst = new Uint8Array(dstBuf, dstByteOffset);
    let srcPos = 0;
    let mask = 0;
    let curByte = 0;
    let dstPos = 0;
    const dstEnd = width * 4;
    while (dstPos < dstEnd) {
      if (mask === 0) {
        mask = 0x80;
        curByte = src[srcPos++]!;
      }
      const g = curByte & mask ? 0xff : 0;
      dst[dstPos++] = g;
      dst[dstPos++] = g;
      dst[dstPos++] = g;
      dst[dstPos++] = 0xff;
      mask >>= 1;
    }
  },
};
