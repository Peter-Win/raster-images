export type PixelFillerCtx = {
  src: Uint8Array;
  srcOffset?: number;
  dst: Uint8Array;
  dstOffset?: number;
};

export type PixelFiller = (
  ctx: PixelFillerCtx,
  srcX: number,
  dstX: number
) => void;
