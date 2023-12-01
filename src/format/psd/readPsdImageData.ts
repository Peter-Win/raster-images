import pako from "pako";
import { Point } from "../../math";
import { PixelDepth } from "../../types";
import { ErrorRI } from "../../utils";
import { RAStream, readWordArray } from "../../stream";
import { unpackBits } from "../../algorithm/PackBits";
import { calcPitch } from "../../ImageInfo/calcPitch";
import { PsdCompression, psdCompressionName } from "./PsdCompression";
import { copyBytes } from "../../Converter/rowOps/copy/copyBytes";

type FnRowPostFx = (dstRow: Uint8Array) => void;

const rowPostFxDuotone: FnRowPostFx = (dstRow) => {
  for (let i = 0; i < dstRow.length; i++) {
    dstRow[i] ^= 0xff;
  }
};

const rowPostFx16: FnRowPostFx = (dstRow) => {
  const dv = new DataView(dstRow.buffer, dstRow.byteOffset);
  const words = new Uint16Array(dstRow.buffer, dstRow.byteOffset);
  for (let i = 0; i < words.length; i++) {
    words[i] = dv.getUint16(i * 2, false);
  }
};

const rowPostFx32: FnRowPostFx = (dstRow) => {
  const dv = new DataView(dstRow.buffer, dstRow.byteOffset);
  const dwords = new Uint32Array(dstRow.buffer, dstRow.byteOffset);
  for (let i = 0; i < dwords.length; i++) {
    dwords[i] = dv.getUint32(i * 4, false);
  }
};

const createPostFx = (depth: PixelDepth): FnRowPostFx | undefined => {
  if (depth === 1) return rowPostFxDuotone;
  if (depth === 16) return rowPostFx16;
  if (depth === 32) return rowPostFx32;
  return undefined;
};

//

export type FnFillRow = (row: Uint8Array, y: number) => Promise<void>;

export type FnPsdReader = (
  stream: RAStream,
  size: Point,
  depth: PixelDepth,
  dataSize?: number
) => Promise<FnFillRow>;

export const readerUncompressed: FnPsdReader = async (stream, size, depth) => {
  const rowSize = calcPitch(size.x, depth);
  const postFx = createPostFx(depth);
  return async (dstRow) => {
    await stream.readBuffer(dstRow, rowSize);
    postFx?.(dstRow);
  };
};

export const readerRLE: FnPsdReader = async (stream, size, depth) => {
  const scanLines = await readWordArray(stream, size.y, false);
  const postFx = createPostFx(depth);
  return async (dstBuf: Uint8Array, y: number) => {
    const srcBuf = await stream.read(scanLines[y]!);
    unpackBits(dstBuf, srcBuf);
    postFx?.(dstBuf);
  };
};

/* eslint no-param-reassign: "off" */
const unzip = async (
  stream: RAStream,
  depth: PixelDepth,
  dataSize?: number,
  unfilter?: (row: Uint8Array) => void
): Promise<FnFillRow> => {
  if (!dataSize) throw Error("Expected dataSize");
  const packedData = await stream.read(dataSize);
  const inflator = new pako.Inflate();
  inflator.push(packedData);
  const unpackedData = inflator.result;
  if (typeof unpackedData === "string")
    throw Error("Expected a buffer, but got a string");
  const postFx = createPostFx(depth);
  if (depth === 32) {
    // Special version for depth = 32
    return async (dstRow: Uint8Array, y: number) => {
      const lineSize = dstRow.length;
      // Будем производить манипуляции прямо в том же буфере, где распакованные данные.
      const tmpBuf = new Uint8Array(
        unpackedData.buffer,
        unpackedData.byteOffset + lineSize * y
      );
      for (let i = 1; i < lineSize; i++) {
        tmpBuf[i] += tmpBuf[i - 1]!;
      }
      const w = lineSize >> 2;
      let pos = 0;
      const ofs2 = w * 2;
      const ofs3 = w * 3;
      for (let i = 0; i < w; i++) {
        dstRow[pos++] = tmpBuf[i]!;
        dstRow[pos++] = tmpBuf[w + i]!;
        dstRow[pos++] = tmpBuf[ofs2 + i]!;
        dstRow[pos++] = tmpBuf[ofs3 + i]!;
      }
      postFx?.(dstRow);
    };
  }
  return async (dstRow: Uint8Array, y: number) => {
    const lineSize = dstRow.length;
    copyBytes(lineSize, unpackedData, lineSize * y, dstRow, 0);
    postFx?.(dstRow);
    unfilter?.(dstRow);
  };
};

export const readerZip: FnPsdReader = async (stream, _size, depth, dataSize) =>
  unzip(stream, depth, dataSize);

const unfilter16 = (row: Uint8Array) => {
  const wrow = new Uint16Array(row.buffer, row.byteOffset);
  const width = row.length >> 1;
  for (let i = 1; i < width; i++) {
    const a = wrow[i - 1]!;
    const b = wrow[i]!;
    wrow[i] = a + b;
  }
};

const unfilter32 = (row: Uint8Array) => {
  const width = row.length >> 2;
  const frow = new Float32Array(row.buffer, row.byteOffset);
  for (let i = 1; i < width; i++) {
    frow[i]! += frow[i - 1]!;
  }
};

const unfilters: Partial<Record<PixelDepth, (row: Uint8Array) => void>> = {
  16: unfilter16,
  32: unfilter32,
};

export const readerZipPrediction: FnPsdReader = async (
  stream,
  _size,
  depth,
  dataSize
) => {
  const unfilter = unfilters[depth];
  return unzip(stream, depth, dataSize, unfilter);
};

const readers: Record<PsdCompression, FnPsdReader | undefined> = {
  [PsdCompression.None]: readerUncompressed,
  [PsdCompression.RLE]: readerRLE,
  [PsdCompression.Zip]: readerZip,
  [PsdCompression.ZipPrediction]: readerZipPrediction,
};

export const createPsdReader = (compression: PsdCompression): FnPsdReader => {
  const reader = readers[compression];
  if (!reader) {
    const m = psdCompressionName[compression] || String(compression);
    throw new ErrorRI(`Invalid PSD compression method: <m>`, { m });
  }
  return reader;
};
