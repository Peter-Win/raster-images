export const rangeLimit = (value: number): number =>
  Math.max(Math.min(value, 255), 0);

export const rangeLimit16 = (value: number): number =>
  Math.max(Math.min(value, 0xffff), 0);
