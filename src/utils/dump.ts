/* eslint default-param-last: "off" */

export const dump = (buf: Uint8Array, begin?: number, end?: number): string =>
  Array.from(buf.slice(begin ?? 0, end ?? buf.byteLength))
    .map((n: number) => n.toString(16).toUpperCase().padStart(2, "0"))
    .join(" ");

export const dumpW = (buf: Uint16Array, begin?: number, end?: number): string =>
  Array.from(buf.slice(begin ?? 0, end ?? buf.byteLength))
    .map((n: number) => n.toString(16).toUpperCase().padStart(4, "0"))
    .join(" ");

export const dumpA = (arr: (number | BigInt)[]): string =>
  arr
    .map((n) => n.toString(16).toUpperCase())
    .map((s) => (s.length & 1 ? `0${s}` : s))
    .join(" ");

export const dumpFloat32 = (
  arr: Float32Array,
  precision: number = 2,
  begin: number = 0,
  end?: number
): string =>
  Array.from(arr.slice(begin, end ?? arr.length))
    .map((n) => n.toFixed(precision))
    .join(" ");
