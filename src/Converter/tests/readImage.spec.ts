import { SurfaceStd } from "../../Surface";
import { dump } from "../../utils";
import { readImage } from "../readImage";
import { stdRowOrder } from "../rowOrder";
import { surfaceConverter } from "../surfaceConverter";
import { testProgress } from "../../tests/testProgress";
import { ProgressInfo } from "../ProgressInfo";

// Имитация чтения данных в формате G8
// Содержимое каждой строки - это номер в порядке чтения. Но нумерация с 1. Чтобы отличать от дефолтного состояния.
const rowReader = () => {
  let curIndex = 1;
  return async (row: Uint8Array) => {
    row.fill(curIndex++);
  };
};

describe("readImage", () => {
  it("fillRow", () => {
    const buf = new Uint8Array(4);
    const fillRow = rowReader();
    fillRow(buf);
    expect(dump(buf)).toBe("01 01 01 01");
    fillRow(buf);
    expect(dump(buf)).toBe("02 02 02 02");
    fillRow(buf);
    expect(dump(buf)).toBe("03 03 03 03");
  });
  it("forward", async () => {
    const img = SurfaceStd.createSign(4, 4, "G8");
    const converter = surfaceConverter(img);
    await readImage(converter, img.info, rowReader());
    expect(dump(img.getRowBuffer(0))).toBe("01 01 01 01");
    expect(dump(img.getRowBuffer(3))).toBe("04 04 04 04");
  });
  it("backward", async () => {
    const img = SurfaceStd.createSign(4, 4, "G8");
    const converter = surfaceConverter(img);
    await readImage(converter, img.info, rowReader(), stdRowOrder("backward"));
    expect(dump(img.getRowBuffer(0))).toBe("04 04 04 04");
    expect(dump(img.getRowBuffer(1))).toBe("03 03 03 03");
    expect(dump(img.getRowBuffer(3))).toBe("01 01 01 01");
  });
  it("custom rowOrder", async () => {
    // Сначала только четные строки, потом нечетные.
    const interlacedRowOrder = function* rowOrderBackward(height: number) {
      for (let y = 0; y < height; y += 2) {
        yield y;
      }
      for (let y = 1; y < height; y += 2) {
        yield y;
      }
    };
    const img = SurfaceStd.createSign(4, 4, "G8");
    const converter = surfaceConverter(img);
    await readImage(converter, img.info, rowReader(), interlacedRowOrder);
    expect(dump(img.getRowBuffer(0))).toBe("01 01 01 01");
    expect(dump(img.getRowBuffer(1))).toBe("03 03 03 03");
    expect(dump(img.getRowBuffer(2))).toBe("02 02 02 02");
    expect(dump(img.getRowBuffer(3))).toBe("04 04 04 04");
  });
  it("progress", async () => {
    const log: ProgressInfo[] = [];
    const img = SurfaceStd.createSign(4, 4, "G8");
    const converter = surfaceConverter(img, testProgress(log));
    await readImage(converter, img.info, rowReader(), stdRowOrder("backward"));
    expect(log[0]).toEqual({
      step: "read",
      value: 0,
      y: 0,
      maxValue: 4,
      init: true,
    });
    expect(log[1]).toEqual({ step: "read", value: 0, y: 3, maxValue: 4 });
    expect(log[2]).toEqual({ step: "read", value: 1, y: 2, maxValue: 4 });
    expect(log[3]).toEqual({ step: "read", value: 2, y: 1, maxValue: 4 });
    expect(log[4]).toEqual({ step: "read", value: 3, y: 0, maxValue: 4 });
  });
});
