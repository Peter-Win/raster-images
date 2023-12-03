import { RAStream } from "../../stream";
import { PnmReader } from "./PnmReader";
import { asciiNumber, checkInterval } from "./asciiNumber";
import { PnmDataType } from "./pnmCommon";

/* eslint no-param-reassign: "off" */

export type PnmRowReader = (
  width: number,
  dstBuffer: Uint8Array
) => Promise<void>;

export type PnmRowReaderGenWithMaxVal = (
  stream: RAStream,
  maxVal: number
) => PnmRowReader;

// Масштабирование по принципу что maxVal всегда превращается в dstMaxVal
// Например maxVal=1, dstMaxVal=255. 0=>0, 1=>255
//       0           1       src
// |-----------|----------|
// 0           128      255  dst
// Если бы каждое исх значение равномерно распределялось в dstMaxVal, то было бы 1=>128
const mapValue = (
  srcValue: number,
  maxValue: number,
  dstMaxValue: number
): number => {
  checkInterval("Pixel value", srcValue, maxValue);
  return Math.floor((srcValue * dstMaxValue) / maxValue);
};

export const pnmRowReaderGrayPlainByte = (
  stream: RAStream,
  maxVal: number
): PnmRowReader => {
  const reader = new PnmReader(stream);
  return async (width: number, dstBuffer: Uint8Array): Promise<void> => {
    for (let x = 0; x < width; x++) {
      const srcValue: string = await reader.readString();
      const numValue = asciiNumber(srcValue);
      dstBuffer[x] = mapValue(numValue, maxVal, 255);
    }
  };
};

export const pnmRowReaderGrayPlainWord = (
  stream: RAStream,
  maxVal: number
): PnmRowReader => {
  const reader = new PnmReader(stream);
  return async (width: number, dstBuffer: Uint8Array): Promise<void> => {
    const wordBuf = new Uint16Array(dstBuffer.buffer, dstBuffer.byteOffset);
    for (let x = 0; x < width; x++) {
      const srcValue: string = await reader.readString();
      const numValue = asciiNumber(srcValue);
      wordBuf[x] = mapValue(numValue, maxVal, 0xffff);
    }
  };
};

export const pnmRowReaderGrayRawByte =
  (stream: RAStream, maxVal: number): PnmRowReader =>
  async (width: number, dstBuffer: Uint8Array): Promise<void> => {
    if (maxVal === 255) {
      // Если масштабирование не требуется, то чтение прямо в целевой буфер
      await stream.readBuffer(dstBuffer, width);
    } else {
      const buf: Uint8Array = await stream.read(width);
      for (let x = 0; x < width; x++) {
        dstBuffer[x] = mapValue(buf[x]!, maxVal, 255);
      }
    }
  };

export const pnmRowReaderGrayRawWord =
  (stream: RAStream, maxVal: number): PnmRowReader =>
  async (width: number, dstBuffer: Uint8Array): Promise<void> => {
    const srcBuf = await stream.read(width * 2);
    const srcView = new DataView(srcBuf.buffer, srcBuf.byteOffset);
    const dstWordBuf = new Uint16Array(dstBuffer.buffer, dstBuffer.byteOffset);
    for (let x = 0; x < width; x++) {
      const pixVal = srcView.getUint16(x * 2, false); // big endian
      dstWordBuf[x] = mapValue(pixVal, maxVal, 0xffff);
    }
  };

export const pnmRowReaderGray = (
  type: PnmDataType,
  stream: RAStream,
  maxVal: number
): PnmRowReader => {
  if (type === "plain") {
    return maxVal < 256
      ? pnmRowReaderGrayPlainByte(stream, maxVal)
      : pnmRowReaderGrayPlainWord(stream, maxVal);
  }
  return maxVal < 256
    ? pnmRowReaderGrayRawByte(stream, maxVal)
    : pnmRowReaderGrayRawWord(stream, maxVal);
};

// ----------------

export const pnmRowReaderRgbPlainByte = (
  stream: RAStream,
  maxVal: number
): PnmRowReader => {
  const reader = new PnmReader(stream);
  return async (width: number, dstBuffer: Uint8Array): Promise<void> => {
    const rowLength = width * 3;
    for (let x = 0; x < rowLength; x++) {
      const srcValue: string = await reader.readString();
      const numValue = asciiNumber(srcValue);
      dstBuffer[x] = mapValue(numValue, maxVal, 255);
    }
  };
};

export const pnmRowReaderRgbPlainWord = (
  stream: RAStream,
  maxVal: number
): PnmRowReader => {
  const reader = new PnmReader(stream);
  return async (width: number, dstBuffer: Uint8Array): Promise<void> => {
    const rowLength = width * 3;
    const wBuf = new Uint16Array(dstBuffer.buffer, dstBuffer.byteOffset);
    for (let x = 0; x < rowLength; x++) {
      const srcValue: string = await reader.readString();
      const numValue = asciiNumber(srcValue);
      wBuf[x] = mapValue(numValue, maxVal, 0xffff);
    }
  };
};

export const pnmRowReaderRgbRawByte =
  (stream: RAStream, maxVal: number): PnmRowReader =>
  async (width: number, dstBuffer: Uint8Array): Promise<void> => {
    const rowLength = width * 3;
    await stream.readBuffer(dstBuffer, rowLength);
    if (maxVal !== 255) {
      for (let x = 0; x < rowLength; x++) {
        dstBuffer[x] = mapValue(dstBuffer[x]!, maxVal, 255);
      }
    }
  };

export const pnmRowReaderRgbRawWord =
  (stream: RAStream, maxVal: number): PnmRowReader =>
  async (width: number, dstBuffer: Uint8Array): Promise<void> => {
    const rowLength = width * 3;
    const srcBuf = await stream.read(rowLength * 2);
    const dv = new DataView(srcBuf.buffer, srcBuf.byteOffset);
    const wBuf = new Uint16Array(dstBuffer.buffer, dstBuffer.byteOffset);
    for (let x = 0; x < rowLength; x++) {
      wBuf[x]! = dv.getUint16(x * 2, false);
    }
    if (maxVal !== 0xffff) {
      for (let x = 0; x < rowLength; x++) {
        wBuf[x] = mapValue(wBuf[x]!, maxVal, 0xffff);
      }
    }
  };

export const pnmRowReaderRgb = (
  type: PnmDataType,
  stream: RAStream,
  maxVal: number
): PnmRowReader => {
  if (type === "plain") {
    return maxVal < 256
      ? pnmRowReaderRgbPlainByte(stream, maxVal)
      : pnmRowReaderRgbPlainWord(stream, maxVal);
  }
  return maxVal < 256
    ? pnmRowReaderRgbRawByte(stream, maxVal)
    : pnmRowReaderRgbRawWord(stream, maxVal);
};

const readFloatRow = async (
  count: number,
  stream: RAStream,
  maxVal: number,
  dstBuffer: Uint8Array
) => {
  const srcRow = await stream.read(count * 4);
  const srcDV = new DataView(srcRow.buffer, srcRow.byteOffset);
  const dstFloat = new Float32Array(dstBuffer.buffer, dstBuffer.byteOffset);
  const littleEndian = maxVal < 0;
  const absMaxVal = Math.abs(maxVal);
  if (absMaxVal === 1 || absMaxVal === 0) {
    // case of maxVal=0 is wrong. so here we ignore it.
    for (let i = 0; i < count; i++) {
      dstFloat[i] = srcDV.getFloat32(i * 4, littleEndian);
    }
  } else {
    // Эта часть пока не тестировалась, т.к. не было найдено ни одного соответствующего изображения.
    const k = 1 / absMaxVal;
    for (let i = 0; i < count; i++) {
      dstFloat[i] = srcDV.getFloat32(i * 4, littleEndian) * k;
    }
  }
};

export const pnmRowReaderRgbFloat =
  (stream: RAStream, maxVal: number): PnmRowReader =>
  (width, dstBuffer) =>
    readFloatRow(width * 3, stream, maxVal, dstBuffer);

export const pnmRowReaderGrayFloat =
  (stream: RAStream, maxVal: number): PnmRowReader =>
  (width, dstBuffer) =>
    readFloatRow(width, stream, maxVal, dstBuffer);

// --- Bitmap

export const pbmRowReaderPlain = (stream: RAStream): PnmRowReader => {
  const reader = new PnmReader(stream);
  return async (width: number, dstBuf: Uint8Array): Promise<void> => {
    // Биты скапливаются в байтовой переменной и выбрасываются в буфер по мере наполнения.
    // В компилируемых яхыках (C, Java) такой подход даёт выигрыш по сравнению с постоянным обращением к буферу.
    // А насчет TS/JS я не уверен. Но пусть хотя бы выглядит как оптимизированный код :)
    let offs = 0;
    let mask = 0x80;
    let byte = 0;
    for (let x = 0; x < width; x++) {
      const sValue: string = await reader.readString();
      // Теоретически здесь может быть что угодно. Но должно быть 0 или 1.
      // Если что-то другое, то будем считать, что это 1.
      if (sValue === "0") {
        byte |= mask; // тут происодит инверсия. исходный 0 в буфер идет как 1
      }
      mask >>= 1;
      if (!mask) {
        mask = 0x80;
        dstBuf[offs++] = byte;
        byte = 0;
      }
    }
    if (mask !== 0x80) {
      dstBuf[offs] = byte;
    }
  };
};

export const pbmRowReaderRaw =
  (stream: RAStream): PnmRowReader =>
  async (width: number, dstBuf: Uint8Array): Promise<void> => {
    const bufSize = (width + 7) >> 3;
    await stream.readBuffer(dstBuf, bufSize);
    for (let i = 0; i < bufSize; i++) dstBuf[i]! ^= 0xff;
  };
