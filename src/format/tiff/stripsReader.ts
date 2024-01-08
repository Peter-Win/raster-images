import { ErrorRI } from "../../utils";
import { RAStream } from "../../stream";
import { copyBytes } from "../../Converter/rowOps/copy/copyBytes";
import { FnTiffPredictor } from "./compression/TiffPredictor";
import { Point } from "../../math";

export type FnStripHandler = (src: Uint8Array, stripSize: Point) => Uint8Array;
// Тут следует учесть, что src и dst может быть одно и то же.
export type FnRowHandler = (
  src: Uint8Array,
  srcPos: number,
  dst: Uint8Array
) => void;

export const defaultRowHandler =
  (rowSize: number): FnRowHandler =>
  (src, srcPos, dst) => {
    copyBytes(rowSize, src, srcPos, dst, 0);
  };

type ParamsStripsReader = {
  offsets: number[];
  sizes: number[];
  stripHandlers: FnStripHandler[];
  rowHandlers: FnRowHandler[];
  stream: RAStream;
  rowSize: number;
  // bytesPerSample: number;
  predictor?: FnTiffPredictor;
  width: number;
  height: number;
  rowsPerStrip: number;
};

/**
 * Важное предположение, что строка всегда целиком помещается в strip.
 */
export const stripsReader = (params: ParamsStripsReader) => {
  const {
    offsets,
    sizes,
    stripHandlers,
    rowHandlers,
    stream,
    rowSize,
    predictor,
    width,
    height,
    rowsPerStrip,
  } = params;
  let currentStripIndex = -1;
  let currentStripPos = 0;
  let stripData = new Uint8Array();
  const mainRowHandler = rowHandlers[0] ?? defaultRowHandler(rowSize);
  const restRowHandlers = rowHandlers.slice(1);
  return async (dstRow: Uint8Array, y: number) => {
    const count = offsets.length;
    if (count !== sizes.length) {
      throw new ErrorRI("Offsets count=<o>, sizes count=<s>", {
        o: count,
        s: sizes.length,
      });
    }
    if (currentStripPos >= stripData.length) {
      currentStripIndex++;
      currentStripPos = 0;
      const offset = offsets[currentStripIndex];
      const size = sizes[currentStripIndex];
      if (offset === undefined || size === undefined) {
        throw Error("Strip overflow");
      }
      await stream.seek(offset);
      stripData = await stream.read(size);
      const stripSize = new Point(width, Math.min(rowsPerStrip, height - y));
      for (const stripHandler of stripHandlers) {
        stripData = stripHandler(stripData, stripSize);
      }
    }
    mainRowHandler(stripData, currentStripPos, dstRow);
    restRowHandlers.forEach((handler) => handler(dstRow, 0, dstRow));
    predictor?.(width, dstRow);
    currentStripPos += rowSize;
  };
};
