import { CvtDescriptorDirect } from "../CvtDescriptor";

export const CvtGray8toRGB8: CvtDescriptorDirect = {
  loss: false,
  speed: 100,
  quality: 100,
  cvt: (
    width: number,
    srcBuf: ArrayBuffer,
    srcStart: number,
    dstBuf: ArrayBuffer,
    dstStart: number
  ) => {
    const src = new Uint8Array(srcBuf, srcStart);
    const dst = new Uint8Array(dstBuf, dstStart);
    let srcPos = 0;
    let dstPos = 0;
    const dstEnd = width * 3;
    while (dstPos < dstEnd) {
      const g = src[srcPos++]!;
      dst[dstPos++] = g;
      dst[dstPos++] = g;
      dst[dstPos++] = g;
    }
  },
};
