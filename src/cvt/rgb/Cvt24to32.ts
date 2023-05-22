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
    const src = new Uint8Array(srcBuf);
    const dst = new Uint8Array(dstBuf);
    let srcPos = srcStart;
    let dstPos = dstStart;
    const dstEnd = width * 4;
    while (dstPos < dstEnd) {
      dst[dstPos++] = src[srcPos++]!;
      dst[dstPos++] = src[srcPos++]!;
      dst[dstPos++] = src[srcPos++]!;
      dst[dstPos++] = 0xff;
    }
  },
};
