// https://www.w3.org/TR/2003/REC-PNG-20031110/#9Filters

import { ErrorRI } from "../../utils";

/* eslint no-param-reassign: "off" */

export interface UnfilterCtx {
  lineSize: number;
  pixelSize: number;
  buf: Uint8Array;
  pos: number;
  prevLine: Uint8Array;
  prevPos: number;
}

export interface PngFilter {
  value: number;
  name: string;
  unfilter?: (ctx: UnfilterCtx) => void;
}

const unfilterSub = ({ lineSize, pixelSize, buf, pos }: UnfilterCtx) => {
  for (let i = pixelSize; i < lineSize; i++) {
    buf[i + pos] += buf[i + pos - pixelSize]!;
  }
};

const unfilterUp = ({
  pixelSize,
  lineSize,
  buf,
  pos,
  prevLine,
  prevPos,
}: UnfilterCtx) => {
  for (let i = pixelSize; i < lineSize; i++) {
    buf[i + pos] += prevLine[i + prevPos]!;
  }
};

const unfilterAverage = ({
  pixelSize,
  lineSize,
  buf,
  pos,
  prevLine,
  prevPos,
}: UnfilterCtx) => {
  for (let i = pixelSize; i < lineSize; i++) {
    buf[i + pos] += (prevLine[i + prevPos]! + buf[i + pos - pixelSize]!) >> 1;
  }
};

const paethPredictor = (a: number, b: number, c: number): number => {
  const p: number = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
};

const unfilterPaeth = ({
  pixelSize,
  lineSize,
  buf,
  pos,
  prevLine,
  prevPos,
}: UnfilterCtx) => {
  for (let i = pixelSize; i < lineSize; i++) {
    buf[i + pos] += paethPredictor(
      buf[i + pos - pixelSize]!,
      prevLine[i + prevPos]!,
      prevLine[i + prevPos - pixelSize]!
    );
  }
};

export const pngFilters: PngFilter[] = [
  { value: 0, name: "None" },
  { value: 1, name: "Sub", unfilter: unfilterSub },
  { value: 2, name: "Up", unfilter: unfilterUp },
  { value: 3, name: "Average", unfilter: unfilterAverage },
  { value: 4, name: "Paeth", unfilter: unfilterPaeth },
];

export const getPngFilterByValue = (value: number): PngFilter => {
  const def = pngFilters[value];
  if (!def) throw new ErrorRI("Unknown PNG filter: <n>", { n: value });
  return def;
};
