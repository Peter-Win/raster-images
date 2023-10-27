import { BitmapFormat } from "raster-images/format";

type LoaderStatus = "none" | "loading" | "ready" | "error";

export const globalState = {
  formatStatus: "none" as LoaderStatus,
  format: null as BitmapFormat | null,
  leftSide: null as HTMLElement | null,
  errorMessage: "",
  redraw: () => {},
  file: null as File | null,

  currentFrame: 0,
  frameStatus: "none" as LoaderStatus,
  redrawFrame: () => {},
  canvasCtx: null as CanvasRenderingContext2D | null,
};
