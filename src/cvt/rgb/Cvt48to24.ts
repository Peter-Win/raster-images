import { CvtDescriptorDirect } from "../CvtDescriptor";

// R16G16B16 -> R8G8B8 or B16G16R16 -> B8G8R8

export const Cvt48to24: CvtDescriptorDirect = {
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
    const dstEnd = width * 3;
    while (dstPos < dstEnd) {
      dst[dstPos++] = src[srcPos++]! >> 8;
      dst[dstPos++] = src[srcPos++]! >> 8;
      dst[dstPos++] = src[srcPos++]! >> 8;
    }
  },
};
