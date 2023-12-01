import { PixelDepth } from "../../types";
import { Point } from "../../math";
import { Surface, SurfaceStd } from "../../Surface";
import { PsdCompression } from "./PsdCompression";
import { FnFillRow, createPsdReader } from "./readPsdImageData";
import { RAStream } from "../../stream";
import { surfaceConverter } from "../../Converter/surfaceConverter";
import { readImage } from "../../Converter";

// Для нескольких каналов необходимо смешивать компоненты пикселей
// Здесь либо можно экономить память, но для этого нужно прыгать файловым указателем.
// Либо читать подряд слои в память, а потом мержить.
// Здесь выбран второй метод, т.к. на первый взгляд он будет работать быстрее.

export class LayersMixer {
  layers: Surface[] = [];

  constructor(public size: Point, public depth: PixelDepth) {}

  async loadLayer(
    compression: PsdCompression,
    stream: RAStream,
    dataSize?: number
  ) {
    const image = SurfaceStd.createSize(this.size, this.depth, {
      colorModel: "Gray",
    });
    const reader = createPsdReader(compression);
    const fillRow = await reader(stream, this.size, this.depth, dataSize);
    await readImage(surfaceConverter(image), image.info, fillRow);
    this.layers.push(image);
  }

  async loadSimilarLayers(
    count: number,
    compression: PsdCompression,
    stream: RAStream
  ) {
    const readers: FnFillRow[] = [];
    // Сначала загружается предварительная информация для всех каналов.
    for (let i = 0; i < count; i++) {
      const reader = createPsdReader(compression);
      readers[i] = await reader(stream, this.size, this.depth);
    }
    // Теперь все каналы друг за другом
    for (let i = 0; i < count; i++) {
      const image = SurfaceStd.createSize(this.size, this.depth, {
        colorModel: "Gray",
      });
      await readImage(surfaceConverter(image), image.info, readers[i]!);
      this.layers.push(image);
    }
  }

  getFillRow(
    layersOrder: number[]
  ): (row: Uint8Array, y: number) => Promise<void> {
    const fillRowGen =
      <T extends TConstr>(
        ArrayConstr: T
      ): ((row: Uint8Array, y: number) => Promise<void>) =>
      async (row, y) => {
        const width = this.size.x;
        let dstPos = 0;
        const srcRows = layersOrder.map((layerIndex) => {
          const bytes = this.layers[layerIndex]!.getRowBuffer(y);
          return ArrayConstr instanceof Uint8Array
            ? bytes
            : new ArrayConstr(bytes.buffer, bytes.byteOffset);
        });
        const nSamples = layersOrder.length;
        const dstRow =
          ArrayConstr instanceof Uint8Array
            ? row
            : new ArrayConstr(row.buffer, row.byteOffset);
        for (let x = 0; x < width; x++) {
          for (let index = 0; index < nSamples; index++) {
            dstRow[dstPos++] = srcRows[index]![x]!;
          }
        }
      };
    const constr = arraysDict[this.depth] ?? Uint8Array;
    return fillRowGen(constr);
  }
}

type TConstr =
  | Uint8ArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor;
const arraysDict: Partial<Record<PixelDepth, TConstr>> = {
  16: Uint16Array,
  32: Uint32Array,
};
