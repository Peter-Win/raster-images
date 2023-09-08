import { CvtDescriptorDirect } from "../CvtDescriptor";

// R16G16B16A16 -> R8G8B8A8 or B16G16R16A16 -> B8G8R8A8

export const Cvt64to32: CvtDescriptorDirect = {
  loss: true,
  speed: 100,
  quality: 80,
  cvt: (
    width: number,
    srcBuf: ArrayBuffer,
    srcStart: number,
    dstBuf: ArrayBuffer,
    dstStart: number
  ) => {
    const src = new Uint16Array(srcBuf, srcStart);
    const dst = new Uint8Array(dstBuf, dstStart);
    let srcPos = 0;
    let dstPos = 0;
    const dstEnd = width * 4;
    while (dstPos < dstEnd) {
      dst[dstPos++] = src[srcPos++]! >> 8;
      dst[dstPos++] = src[srcPos++]! >> 8;
      dst[dstPos++] = src[srcPos++]! >> 8;
      dst[dstPos++] = src[srcPos++]! >> 8;
    }
  },
};
