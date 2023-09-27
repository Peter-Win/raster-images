// https://en.wikipedia.org/wiki/Relative_luminance
// Y=0.2126R + 0.7152G+0.0722B

import { CvtDescriptorDirect } from "../CvtDescriptor";

// Честно говоря, я не уверен, что вычисление по таблице даст преимущество.
// Для старых процессоров это работало хорошо. Для графического акселератора это уже будет работать плохо.
// А для JavaScript надо проверять. Причем и в браузере, и в NodeJS.

const scaleBits = 16;
const oneHalf = 1 << (scaleBits - 1);
const fix = (x: number) => x * (1 << scaleBits) + 0.5;

// Тут тоже не совсем понятно, даст ли какой-то положительный эффект экономия 3 KB памяти.
// Но всё-таки не будем заранее выделять память на то, что может вообще не пригодиться в работе приложения.
type TablesBGR = [Uint32Array, Uint32Array, Uint32Array];
let tablesCache: TablesBGR;

const getTables = (): [Uint32Array, Uint32Array, Uint32Array] => {
  if (tablesCache !== undefined) return tablesCache;
  const tables: TablesBGR = [
    new Uint32Array(256),
    new Uint32Array(256),
    new Uint32Array(256),
  ];
  const kr = fix(0.2126);
  const kg = fix(0.7152);
  const kb = fix(0.0722);
  for (let i = 0; i < 256; i++) {
    tables[2][i] = kr * i;
    tables[1][i] = kg * i;
    tables[0][i] = kb * i + oneHalf;
  }
  tablesCache = tables;
  return tables;
};

export const CvtBGRtoG8: CvtDescriptorDirect = {
  loss: true,
  speed: 90,
  quality: 90,
  cvt: (
    width: number,
    srcBuf: ArrayBuffer,
    srcStart: number,
    dstBuf: ArrayBuffer,
    dstStart: number
  ) => {
    const tables = getTables();
    const src = new Uint8Array(srcBuf, srcStart); // 1 pixel = 3 bytes
    const dst = new Uint8Array(dstBuf, dstStart); // 1 pixel = 1 byte
    let srcPos = 0;
    let dstPos = 0;
    while (dstPos < width) {
      const b = src[srcPos++]!;
      const g = src[srcPos++]!;
      const r = src[srcPos++]!;
      dst[dstPos++] =
        (tables[0][b]! + tables[1][g]! + tables[2][r]!) >> scaleBits;
    }
  },
};

export const CvtRGBtoG8: CvtDescriptorDirect = {
  loss: true,
  speed: 90,
  quality: 90,
  cvt: (
    width: number,
    srcBuf: ArrayBuffer,
    srcStart: number,
    dstBuf: ArrayBuffer,
    dstStart: number
  ) => {
    const tables = getTables();
    const src = new Uint8Array(srcBuf, srcStart); // 1 pixel = 3 bytes
    const dst = new Uint8Array(dstBuf, dstStart); // 1 pixel = 1 byte
    let srcPos = 0;
    let dstPos = 0;
    while (dstPos < width) {
      const r = src[srcPos++]!;
      const g = src[srcPos++]!;
      const b = src[srcPos++]!;
      dst[dstPos++] =
        (tables[0][b]! + tables[1][g]! + tables[2][r]!) >> scaleBits;
    }
  },
};
