export const subBuffer = (
  buf: Uint8Array,
  offset: number,
  size?: number
): Uint8Array => new Uint8Array(buf.buffer, buf.byteOffset + offset, size);
