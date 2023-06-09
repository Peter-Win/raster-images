export const dump = (buf: Uint8Array, begin?: number, end?: number): string =>
  Array.from(buf.slice(begin ?? 0, end ?? buf.byteLength))
    .map((n: number) => n.toString(16).toUpperCase().padStart(2, "0"))
    .join(" ");

export const dumpA = (arr: (number | BigInt)[]): string =>
  arr
    .map((n) => n.toString(16).toUpperCase())
    .map((s) => (s.length & 1 ? `0${s}` : s))
    .join(" ");
