import { CvtDescriptorDirect } from "../CvtDescriptor";

export const CvtGray16toGray8: CvtDescriptorDirect = {
  loss: true,
  speed: 100,
  quality: 80,
  cvt: (
    width: number,
    srcBuf: ArrayBuffer,
    srcByteOffset: number,
    dstBuf: ArrayBuffer,
    dstByteOffset: number
  ) => {
    const src = new Uint16Array(srcBuf, srcByteOffset);
    const dst = new Uint8Array(dstBuf, dstByteOffset);
    let srcPos = 0;
    let dstPos = 0;
    const dstEnd = width;
    while (dstPos < dstEnd) {
      dst[dstPos++] = src[srcPos++]! >> 8;
    }
  },
};
