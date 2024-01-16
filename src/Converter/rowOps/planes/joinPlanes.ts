export const joinPlanes = (
  width: number,
  bytesPerSample: number,
  planes: Uint8Array[],
  dst: Uint8Array
) => {
  let srcPos = 0;
  let dstPos = 0;
  for (let x = 0; x < width; x++) {
    for (const src of planes) {
      for (let iByte = 0; iByte < bytesPerSample; iByte++) {
        // eslint-disable-next-line no-param-reassign
        dst[dstPos++] = src[srcPos + iByte]!;
      }
    }
    srcPos += bytesPerSample;
  }
};
