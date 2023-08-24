import { CvtDescriptorDirect } from "../CvtDescriptor";

export const Cvt15to24Quality: CvtDescriptorDirect = {
  loss: false,
  speed: 50,
  quality: 100,
  cvt: (width, srcBuf, srcByteOffset, dstBuf, dstByteOffset) => {
    const src = new Uint16Array(srcBuf, srcByteOffset);
    const dst = new Uint8Array(dstBuf, dstByteOffset);
    let srcPos = 0;
    let dstPos = 0;
    const srcEnd = srcPos + width;
    while (srcPos < srcEnd) {
      const a = src[srcPos++]!;
      let c = a & 0x1f; // first
      dst[dstPos++] = (c >> 2) | (c << 3);
      c = (a >> 5) & 0x1f; // second component
      dst[dstPos++] = (c >> 2) | (c << 3);
      c = (a >> 10) & 0x1f; // third component
      dst[dstPos++] = (c >> 2) | (c << 3);
    }
  },
};

export const Cvt15to24Fast: CvtDescriptorDirect = {
  loss: false,
  speed: 100,
  quality: 50,
  cvt: (width, srcBuf, srcOffset, dstBuf, dstOffset) => {
    const src = new Uint16Array(srcBuf, srcOffset);
    const dst = new Uint8Array(dstBuf, dstOffset);
    let srcPos = 0;
    let dstPos = 0;
    const srcEnd = srcPos + width;
    while (srcPos < srcEnd) {
      const a = src[srcPos++]!;
      dst[dstPos++] = a << 3;
      dst[dstPos++] = (a >> 2) & 0xf8;
      dst[dstPos++] = (a >> 7) & 0xf8;
    }
  },
};
