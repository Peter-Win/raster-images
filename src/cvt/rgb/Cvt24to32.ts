import { CvtDescriptorDirect } from "../CvtDescriptor";

export const Cvt24to32: CvtDescriptorDirect = {
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
    const dstEnd = width * 4;
    while (dstPos < dstEnd) {
      dst[dstPos++] = src[srcPos++]!;
      dst[dstPos++] = src[srcPos++]!;
      dst[dstPos++] = src[srcPos++]!;
      dst[dstPos++] = 0xff;
    }
  },
};
