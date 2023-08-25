// https://www.w3.org/TR/2003/REC-PNG-20031110/#9Filters

import { ErrorRI } from "../../utils";

export interface PngFilter {
  value: number;
  name: string;
}

export const pngFilters: PngFilter[] = [
  { value: 0, name: "None" },
  { value: 1, name: "Sub" },
  { value: 2, name: "Up" },
  { value: 3, name: "Average" },
  { value: 4, name: "Paeth" },
];

export const getPngFilterByValue = (value: number): PngFilter => {
  const def = pngFilters[value];
  if (!def) throw new ErrorRI("Unknown PNG filter: <n>", { n: value });
  return def;
};
