export const textFromBuffer = (buf: Uint8Array): string =>
  Array.from(buf)
    .map((value) => String.fromCharCode(value))
    .join("");
