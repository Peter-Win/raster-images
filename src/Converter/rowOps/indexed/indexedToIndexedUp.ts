/**
 * Conversion indexed formats from low to large bit per/pixel.
 */

import { FnRowOp } from "../FnRowOp";

export const indexed1toIndexed8: FnRowOp = (width, src, dst) => {
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
};

export const indexed4toIndexed8: FnRowOp = (width, src, dst) => {
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
};
