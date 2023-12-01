export type PixelDepth =
  | 0
  | 1
  | 2
  | 4
  | 8
  | 15
  | 16
  | 24
  | 32
  | 40
  | 48
  | 64
  | 80 // C16M16Y16K16A16
  | 96
  | 128;

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;
