import { ImageInfo } from "../ImageInfo";
import { ImageReader } from "./ImageReader";
import { FnRowOrder, rowOrderForward } from "./rowOrder";

interface ParamsReadLoop {
  info: ImageInfo;
  reader: ImageReader;
  rowOrder?: FnRowOrder;
  onRow: (row: Uint8Array, y: number, i: number) => Promise<void>;
}

export const readLoop = async ({
  info,
  reader,
  onRow,
  rowOrder = rowOrderForward,
}: ParamsReadLoop) => {
  const height = info.size.y;
  const gen = rowOrder(height);
  await reader.onStart(info);
  const progressInfo = { step: "read", value: 0, maxValue: height };
  for (let j = 0; j < height; j++) {
    progressInfo.value = j;
    if (reader.progress) {
      await reader.progress(progressInfo);
    }
    const y = gen.next().value as number;
    const row = await reader.getRowBuffer(y);
    await onRow(row, y, j);
    await reader.finishRow(y);
  }
  if (reader.onFinish) {
    await reader.onFinish();
  }
  if (reader.progress) {
    progressInfo.value = height;
    await reader.progress(progressInfo);
  }
};
