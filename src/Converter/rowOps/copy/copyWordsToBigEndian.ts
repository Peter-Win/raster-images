export const copyWordsToBigEndian = (
  wordsCount: number,
  src: ArrayBuffer,
  srcByteOffset: number,
  dst: ArrayBuffer,
  dstByteOffset: number
) => {
  const dstDataView = new DataView(dst, dstByteOffset);
  const wSrc = new Uint16Array(src, srcByteOffset);
  let dstPos = 0;
  for (let i = 0; i < wordsCount; i++) {
    dstDataView.setUint16(dstPos, wSrc[i]!, false);
    dstPos += 2;
  }
};
