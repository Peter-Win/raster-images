/**
 * @see https://www.w3.org/TR/2003/REC-PNG-20031110/#11tIME
 */

import { timeToString } from "../../../ImageInfo/timeInfo";
import {
  FieldsBlock,
  fieldByte,
  fieldWord,
  readFieldsBlockFromBuffer,
  writeFieldsBlockToBuffer,
} from "../../FieldsBlock";

export interface PngTime {
  year: number; // 2 bytes (complete; for example, 1995, not 95)
  month: number; // 1 byte (1-12)
  day: number; // 1 byte (1-31)
  hour: number; // 1 byte (0-23)
  minute: number; // 1 byte (0-59)
  second: number; // 1 byte (0-60) (to allow for leap seconds)
}

const descrPngTime: FieldsBlock<PngTime> = {
  littleEndian: false,
  fields: [
    fieldWord("year"),
    fieldByte("month"),
    fieldByte("day"),
    fieldByte("hour"),
    fieldByte("minute"),
    fieldByte("second"),
  ],
};

export const getPngTimeFromBuffer = (buf: Uint8Array): PngTime =>
  readFieldsBlockFromBuffer(buf, descrPngTime);

export const pngTimeToDate = (t: PngTime): Date =>
  new Date(t.year, t.month - 1, t.day, t.hour, t.minute, t.second);

export const pngTimeToText = (t: PngTime): string =>
  timeToString(pngTimeToDate(t));

export const dateToPngTime = (d: Date): PngTime => ({
  year: d.getFullYear(),
  month: d.getMonth() + 1,
  day: d.getDate(),
  hour: d.getHours(),
  minute: d.getMinutes(),
  second: d.getSeconds(),
});

export const writePngTimeToBuffer = (t: PngTime): Uint8Array =>
  writeFieldsBlockToBuffer(t, descrPngTime);
