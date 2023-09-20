export type HistArray = Uint16Array;

export const enum HistParams {
  bits = 6, // bits of precision
  elems = 1 << bits, // # of elements along histogram axes
  maxElem = elems - 1,
  shift = 8 - bits,
  size = elems * elems * elems,
}

export const createHistArray = (): HistArray =>
  new Uint16Array(HistParams.size);

export const calcHistOffsetFast = (c0: number, c1: number, c2: number) =>
  (((c0 << HistParams.bits) + c1) << HistParams.bits) + c2;

export const calcHistOffset = (c0: number, c1: number, c2: number) =>
  calcHistOffsetFast(
    c0 >> HistParams.shift,
    c1 >> HistParams.shift,
    c2 >> HistParams.shift
  );
