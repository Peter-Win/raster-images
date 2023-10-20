import { RowsReader } from "./Converter";
import { OnProgressInfo, createProgressTracker } from "./ProgressInfo";
import { FnRowOrder, rowOrderForward } from "./rowOrder";

/**
 * Стандартный шаблон для записи изображения.
 * То есть, копирование данных из поверхности в произвольный алгоритм обработки.
 *
 * @param reader
 * @param writeRow
 * @param progress
 */
export const writeImage = async (
  reader: RowsReader,
  writeRow: (row: Uint8Array, y: number, index: number) => Promise<void>,
  options?: {
    progress?: OnProgressInfo;
    rowOrder?: FnRowOrder;
  }
) => {
  const { progress, rowOrder = rowOrderForward } = options || {};
  const { dstInfo } = reader;
  const height = dstInfo.size.y;
  const gen = rowOrder(height);
  const onProgress = createProgressTracker(progress, "write", height);
  await onProgress(0, 0, true);
  for (let i = 0; i < height; i++) {
    const y = gen.next().value;
    if (typeof y === "number") {
      await onProgress(i, y);
      const srcRow = await reader.readRow(y);
      await writeRow(srcRow, y, i);
    }
  }
  await onProgress(height, height);
  await reader.finish();
};
