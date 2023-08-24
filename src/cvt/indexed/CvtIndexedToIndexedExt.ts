/**
 * Conversion indexed formats from low to large bit per/pixel.
 * G1 -> G8
 * G4 -> G8
 */

import { CvtDescriptorDirect } from "../CvtDescriptor";

export const CvtI1toI8: CvtDescriptorDirect = {
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
    let dstPos = 0;
    let srcPos = 0;
    let srcByte = 0;
    let srcShift = -1;
    while (dstPos < width) {
      if (srcShift < 0) {
        srcShift = 7;
        srcByte = src[srcPos++]!;
      }
      dst[dstPos++] = (srcByte >> srcShift) & 1;
      srcShift--;
    }
  },
};

export const CvtI4toI8: CvtDescriptorDirect = {
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
    let dstPos = 0;
    let srcPos = 0;
    let srcByte = 0;
    let srcShift = -1;
    while (dstPos < width) {
      if (srcShift < 0) {
        srcShift = 4;
        srcByte = src[srcPos++]!;
      }
      dst[dstPos++] = (srcByte >> srcShift) & 0x0f;
      srcShift -= 4;
    }
  },
};
