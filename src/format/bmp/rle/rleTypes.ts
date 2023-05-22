export const enum Res {
  endOfLine = 0,
  endOfImage = 1,
  setPos = 2,
  escCount = 3,
}

export type RleContext = {
  res: Res;
  x: number;
  y: number;
};

export type FnRleUnpack = (
  srcData: Uint8Array,
  srcPos: number,
  dst: Uint8Array,
  ctx: RleContext
) => number;
