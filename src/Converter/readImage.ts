import { ImageInfo } from "../ImageInfo";
import { Converter } from "./Converter";
import { createProgressTracker } from "./ProgressInfo";
import { FnRowOrder, rowOrderForward } from "./rowOrder";

/**
 * Стандартный шаблон для чтения изображения.
 * Здесь под чтением подразумевается копирование пиксельной информации из произвольного источника в поверхность.
 * @param converter
 * @param srcInfo
 * @param fillRow функция заполнения строки считанными данными. Здесь формат пикселей буфера соответствует srcInfo.
 */
export const readImage = async (
  converter: Converter,
  srcInfo: ImageInfo,
  fillRow: (row: Uint8Array, y: number, index: number) => Promise<void>,
  rowOrder: FnRowOrder = rowOrderForward
) => {
  const height = srcInfo.size.y;
  const gen = rowOrder(height);
  const rowsWriter = await converter.getRowsWriter(srcInfo);
  const onProgress = createProgressTracker(converter.progress, "read", height);
  await onProgress(0, 0, true);
  for (let i = 0; i < height; i++) {
    const y = gen.next().value;
    if (typeof y === "number") {
      await onProgress(i, y);
      const dstRow = await rowsWriter.getBuffer(y);
      await fillRow(dstRow, y, i);
      await rowsWriter.flushBuffer(y);
    }
  }
  await onProgress(height, height);
  await rowsWriter.finish();
};
