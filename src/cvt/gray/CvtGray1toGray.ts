import { CvtDescriptorDirect } from "../CvtDescriptor";

export const CvtGray1toGray8: CvtDescriptorDirect = {
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
    const dstEnd = width;
    while (dstPos < dstEnd) {
      if (mask === 0) {
        mask = 0x80;
        curByte = src[srcPos++]!;
      }
      dst[dstPos++] = curByte & mask ? 0xff : 0;
      mask >>= 1;
    }
  },
};
