import { Variables } from "../../../ImageInfo/Variables";
import { Point } from "../../../math";

export const getNativeBitsPerSamples = (
  vars: Variables | undefined
): number[] | undefined => {
  const nbpsv = vars?.bitsPerSample;
  return Array.isArray(nbpsv) ? nbpsv.map((n) => +n) : undefined;
};

export const getPlanarNativeBitsPerSamples = (
  nativeBitsPerSamples: number[] | undefined,
  planeIndex: number
): number[] | undefined => {
  const curBps = nativeBitsPerSamples?.[planeIndex];
  return curBps ? [curBps] : undefined;
};

/**
 * Извлечение упакованных битов для нестандартных значений бит/компонент.
 * Например, [12,12,12] или [8,9,10] будет транслироваться в [16,16,16].
 * Важно, что биты упакованы подряд. Даже если они относятся к разным строкам.
 * Первыми идут старшие биты, что соответствует FillOrder=1.
 * Компоненты чередуются, что соответствует PlanarConfiguration=1.
 */
export const expandBitSamples = (
  nativeBitsPerSamples: number[],
  srcData: Uint8Array,
  size: Point
): Uint8Array => {
  const nSamples = nativeBitsPerSamples.length;
  const { x: width, y: height } = size;
  const rowLength = nSamples * width;
  const wdst = new Uint16Array(rowLength * height);

  let srcPos = 0;
  let srcByte = 0;
  let srcLeftBits = 0;
  let dstPos = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let n = 0; n < nSamples; n++) {
        let sampleValue = 0;
        const bitsPerSample = nativeBitsPerSamples[n]!;
        let sampleLeftBits = bitsPerSample;
        while (sampleLeftBits > 0) {
          if (srcLeftBits === 0) {
            srcByte = srcData[srcPos++]!;
            srcLeftBits = 8;
          }
          const bitsFromSrc = Math.min(srcLeftBits, sampleLeftBits);
          sampleValue <<= bitsFromSrc; // то что уже есть в sampleValue, сдвигается в старшие разряды
          // Из srcByte нужно брать старшие биты, начиная с srcLeftBits, в количестве bitsFromSrc
          const mask = (1 << bitsFromSrc) - 1;
          const usefulPartFromSrc = srcByte >> (srcLeftBits - bitsFromSrc);
          sampleValue |= usefulPartFromSrc & mask;
          sampleLeftBits -= bitsFromSrc;
          srcLeftBits -= bitsFromSrc;
        }
        if (bitsPerSample < 16) {
          wdst[dstPos++] = sampleValue << (16 - bitsPerSample);
        } else if (bitsPerSample > 16) {
          wdst[dstPos++] = sampleValue >>> (bitsPerSample - 16);
        }
      }
    }
  }

  return new Uint8Array(wdst.buffer, wdst.byteOffset);
};
