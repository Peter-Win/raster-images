export const is0 = (value: number) => Math.abs(value) < 0.001;

export const isClose = (a: number, b: number) => is0(Math.abs(a) - Math.abs(b));

export const toa = (value: number): string =>
  value.toFixed(2).replace(/0+$/g, "").replace(/\.$/, "").replace(/^-0$/, "0");

export * from "./Point";
