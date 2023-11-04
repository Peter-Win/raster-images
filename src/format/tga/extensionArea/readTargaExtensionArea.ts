import { PaletteItem } from "../../../Palette";
import { Rational } from "../../../math";
import { RAStream } from "../../../stream";
import { bytesToUtf8, subBuffer } from "../../../utils";
import {
  TargaExtensionArea,
  AttributesType,
  ExtAreaSizes,
} from "./TargaExtensionArea";

export const readTargaExtensionArea = async (
  stream: RAStream
): Promise<TargaExtensionArea | undefined> => {
  const buf1 = await stream.read(2);
  const dv1 = new DataView(buf1.buffer, buf1.byteOffset);
  const size = dv1.getUint16(0, true);
  if (size !== 495) return undefined;
  const buf2 = await stream.read(493);
  const dv2 = new DataView(buf2.buffer, buf2.byteOffset);
  let pos = 0;
  const readZeroEndedString = (length: number): string => {
    const s = bytesToUtf8(subBuffer(buf2, pos, length));
    pos += length;
    return s.replace(/[\s\0]*$/, "");
  };
  const readComment = (): string[] => {
    const lines: string[] = [];
    for (let i = 0; i < 4; i++) {
      const ln = readZeroEndedString(ExtAreaSizes.authorCommentLine);
      if (ln) lines.push(ln);
    }
    return lines;
  };
  const readByte = (): number => buf2[pos++]!;
  const readWord = (): number => {
    const word = dv2.getUint16(pos, true);
    pos += 2;
    return word;
  };
  const readDWord = (): number => {
    const value = dv2.getUint32(pos, true);
    pos += 4;
    return value;
  };
  const readDate = () => {
    const month = readWord(); // (1 - 12)
    const day = readWord();
    const year = readWord();
    const hour = readWord();
    const minute = readWord();
    const second = readWord();
    if (month === 0) return undefined;
    return new Date(year, month - 1, day, hour, minute, second);
  };
  const readTime = () => {
    const hours = readWord();
    const minutes = readWord();
    const seconds = readWord();
    return (hours * 60 + minutes) * 60 + seconds;
  };
  const readVersion = () => {
    const n = readWord();
    const c = readByte();
    let s = "";
    if (n === 0) return s;
    s += (n / 100).toFixed(2);
    if (c !== 0 && c !== 32) s += String.fromCharCode(c);
    return s;
  };
  const readColor = (): PaletteItem => [
    readByte(),
    readByte(),
    readByte(),
    readByte(),
  ];
  const readRational = () => new Rational(readWord(), readWord());
  return {
    authorName: readZeroEndedString(ExtAreaSizes.authorName),
    authorComment: readComment(),
    dateTime: readDate(),
    jobName: readZeroEndedString(ExtAreaSizes.jobName),
    jobTimeInSeconds: readTime(),
    softwareID: readZeroEndedString(ExtAreaSizes.softwareID),
    softwareVersion: readVersion(),
    keyColor: readColor(),
    aspectRatio: readRational(),
    gamma: readRational(),
    colorCorrectionOffset: readDWord(),
    postageStampOffset: readDWord(),
    scanLineOffset: readDWord(),
    attributesType: readByte() as AttributesType,
  };
};
