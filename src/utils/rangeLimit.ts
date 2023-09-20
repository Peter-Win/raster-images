export const rangeLimit = (value: number): number =>
  Math.max(Math.min(value, 255), 0);
