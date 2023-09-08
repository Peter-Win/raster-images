export const copyWordsFromBigEndian = (
  wordsCount: number,
  src: ArrayBuffer,
  srcOffset: number,
  dst: ArrayBuffer,
  dstOffset: number
) => {
  const srcDataView = new DataView(src, srcOffset);
  const wDst = new Uint16Array(dst, dstOffset);
  for (let i = 0; i < wordsCount; i++) {
    wDst[i] = srcDataView.getUint16(i * 2, false);
  }
};
