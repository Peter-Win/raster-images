export type FnNumberConversion = (
  littleEndian: boolean,
  count: number,
  src: Uint8Array,
  srcOfs: number,
  dst: Uint8Array,
  dstOfs: number
) => void;
