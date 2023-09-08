import pako from "pako";
import { bytesToUtf8 } from "../../../utils";

export interface PngText {
  readonly keyword: string;
  readonly text: string;
  readonly language?: string;
  readonly compressionFlag?: number;
  readonly translatedKeyword?: string;
}

const readLatinZE = (
  buffer: Uint8Array,
  startPos: number
): [string, number] => {
  let pos = startPos;
  let text = "";
  const { length } = buffer;
  while (pos < length) {
    const byte: number = buffer[pos++]!;
    if (byte === 0) break;
    text += String.fromCharCode(byte);
  }
  return [text, pos];
};

const readUtf8ZE = (buffer: Uint8Array, startPos: number): [string, number] => {
  let result = "";
  let endPos = startPos;
  const { length } = buffer;
  while (endPos < length && buffer[endPos]) endPos++;
  if (endPos > startPos) {
    const srcData = new Uint8Array(
      buffer.buffer,
      buffer.byteOffset + startPos,
      endPos - startPos
    );
    result = bytesToUtf8(srcData);
  }
  if (endPos < length) endPos++; // skip zero byte
  return [result, endPos];
};

/**
 * tEXt Textual data
 * @see https://www.w3.org/TR/2003/REC-PNG-20031110/#11tEXt
 * @param chunkData the result of readPngChunkRest or readPngChunkDataOnly
 */
export const readPngText = (chunkData: Uint8Array): PngText => {
  const [keyword, pos1] = readLatinZE(chunkData, 0);
  const rawData = new Uint8Array(chunkData.buffer, chunkData.byteOffset + pos1);
  const [text] = readLatinZE(rawData, 0);
  return { keyword, text };
};

/**
 * iTXt International textual data
 * @see https://www.w3.org/TR/2003/REC-PNG-20031110/#11iTXt
 * @param chunkData the result of readPngChunkRest or readPngChunkDataOnly
 */
export const readPngInternationalText = (chunkData: Uint8Array): PngText => {
  const [keyword, pos1] = readLatinZE(chunkData, 0);
  const compressionFlag: number = chunkData[pos1]!;
  const [language, pos2] = readLatinZE(chunkData, pos1 + 2);
  const [translatedKeyword, pos3] = readUtf8ZE(chunkData, pos2);
  // Пока не учитывается compressionFlag
  const [text] = readUtf8ZE(chunkData, pos3);
  return {
    keyword,
    language,
    compressionFlag,
    translatedKeyword,
    text,
  };
};

/**
 * zTXt Compressed textual data
 * @see https://www.w3.org/TR/2003/REC-PNG-20031110/#11zTXt
 * @param chunkData the result of readPngChunkRest or readPngChunkDataOnly
 */
export const readPngZipText = (chunkData: Uint8Array): PngText => {
  const [keyword, pos1] = readLatinZE(chunkData, 0);
  const inflator = new pako.Inflate();
  inflator.push(
    new Uint8Array(chunkData.buffer, chunkData.byteOffset + pos1 + 1)
  );
  const { result } = inflator;
  const text: string =
    typeof result === "string" ? result : readUtf8ZE(result, 0)[0];
  return {
    keyword,
    text,
  };
};
