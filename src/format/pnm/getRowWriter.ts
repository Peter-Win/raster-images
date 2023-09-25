import { utf8ToBytes } from "../../utils";
import { copyWordsToBigEndian } from "../../cvt/copy/copyWordsToBigEndian";
import { PnmDataType, PnmMapFormat } from "./pnmCommon";

export type RowWriter = (srcRow: Uint8Array) => Uint8Array;

type PlainRowWriterFactory = (width: number, maxLength: number) => RowWriter;

export const plainBitmapRowWriter: PlainRowWriterFactory = (
  width,
  maxLength
) => {
  const dstBuf = new Uint8Array(width * 2);
  const chrZero = 0x30;
  const chrOne = 0x31;
  const chrSpace = 0x20;
  const chrEol = 0x0a;
  return (srcRow) => {
    let srcPos = 0;
    let dstPos = 0;
    let dstRowStart = 0;
    let mask = 0x80;
    for (let x = 0; x < width; x++) {
      dstBuf[dstPos++] = srcRow[srcPos]! & mask ? chrZero : chrOne;
      if (dstPos - dstRowStart + 1 >= maxLength) {
        dstBuf[dstPos++] = chrEol;
        dstRowStart = dstPos;
      } else {
        dstBuf[dstPos++] = chrSpace;
      }
      mask >>= 1;
      if (!mask) {
        mask = 0x80;
        srcPos++;
      }
    }
    dstBuf[dstPos - 1] = chrEol;
    return dstBuf;
  };
};

export const negBytesFactory = (width: number): RowWriter => {
  const buf = new Uint8Array((width + 7) >> 3);
  return (srcRow) => {
    for (let i = 0; i < srcRow.length; i++) {
      buf[i] = ~srcRow[i]!;
    }
    return buf;
  };
};

export const makeAsciiRow = (
  src: Uint8Array | Uint16Array,
  maxLength: number
): string => {
  const width = src.length;
  if (!width) return "";
  const v0 = String(src[0]);
  const chunks: string[] = [v0];
  let lastLength = v0.length;
  for (let i = 1; i < src.length; i++) {
    const value = String(src[i]);
    const newLength = lastLength + 1 + value.length;
    if (newLength > maxLength) {
      chunks.push("\n");
      lastLength = value.length;
    } else {
      chunks.push(" ");
      lastLength = newLength;
    }
    chunks.push(value);
  }
  chunks.push("\n");
  return chunks.join("");
};

export const getRowWriter = (params: {
  dataType: PnmDataType;
  mapFormat: PnmMapFormat;
  is16bit: boolean;
  width: number;
  maxRowLength: number;
}): RowWriter => {
  const { dataType, mapFormat, is16bit, width, maxRowLength } = params;
  if (mapFormat === "bitmap") {
    return dataType === "plain"
      ? plainBitmapRowWriter(width, maxRowLength)
      : negBytesFactory(width);
  }
  if (mapFormat === "graymap") {
    if (is16bit) {
      if (dataType === "plain") {
        return (srcRow: Uint8Array) =>
          utf8ToBytes(
            makeAsciiRow(
              new Uint16Array(srcRow.buffer, srcRow.byteOffset, width),
              maxRowLength
            )
          );
      }
      const buf = new Uint8Array(width * 2);
      return (srcRow: Uint8Array) => {
        copyWordsToBigEndian(
          width,
          srcRow.buffer,
          srcRow.byteOffset,
          buf.buffer,
          buf.byteOffset
        );
        return buf;
      };
    }
    if (dataType === "plain") {
      return (srcRow: Uint8Array) =>
        utf8ToBytes(makeAsciiRow(srcRow, maxRowLength));
    }
  }
  if (is16bit) {
    if (dataType === "plain") {
      return (srcRow: Uint8Array) =>
        utf8ToBytes(
          makeAsciiRow(
            new Uint16Array(srcRow.buffer, srcRow.byteOffset, width * 3),
            maxRowLength
          )
        );
    }
    const buf = new Uint8Array(width * 6);
    return (srcRow: Uint8Array) => {
      copyWordsToBigEndian(
        width * 3,
        srcRow.buffer,
        srcRow.byteOffset,
        buf.buffer,
        buf.byteOffset
      );
      return buf;
    };
  }
  if (dataType === "plain") {
    return (srcRow: Uint8Array) =>
      utf8ToBytes(makeAsciiRow(srcRow, maxRowLength));
  }
  return (srcRow) => srcRow;
};
