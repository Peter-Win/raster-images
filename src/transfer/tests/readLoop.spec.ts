import { SurfaceStd } from "../../Surface";
import { testProgress } from "../../tests/testProgress";
import { dump } from "../../utils";
import { ProgressInfo } from "../ProgressInfo";
import { SurfaceReader } from "../SurfaceReader";
import { readLoop } from "../readLoop";
import { stdRowOrder } from "../rowOrder";

describe("readLoop", () => {
  const onRow = async (row: Uint8Array, _y: number, i: number) => {
    for (let x = 0; x < row.length; x++) {
      // eslint-disable-next-line no-param-reassign
      row[x] = i + x;
    }
  };

  it("forward", async () => {
    const img = SurfaceStd.create(4, 3, 8);
    const progressLog: ProgressInfo[] = [];
    const reader = new SurfaceReader(img, testProgress(progressLog));
    await readLoop({
      info: img.info,
      reader,
      onRow,
    });
    expect(dump(img.getRowBuffer(0))).toBe("00 01 02 03");
    expect(dump(img.getRowBuffer(1))).toBe("01 02 03 04");
    expect(dump(img.getRowBuffer(2))).toBe("02 03 04 05");
    expect(progressLog[0]).toEqual({ step: "read", value: 0, maxValue: 3 });
    expect(progressLog[1]).toEqual({ step: "read", value: 1, maxValue: 3 });
    expect(progressLog[3]).toEqual({ step: "read", value: 3, maxValue: 3 });
  });

  it("backward", async () => {
    const img = SurfaceStd.create(4, 3, 8);
    const progressLog: ProgressInfo[] = [];
    const reader = new SurfaceReader(img, testProgress(progressLog));
    await readLoop({
      info: img.info,
      rowOrder: stdRowOrder("backward"),
      reader,
      onRow,
    });
    expect(dump(img.getRowBuffer(0))).toBe("02 03 04 05");
    expect(dump(img.getRowBuffer(1))).toBe("01 02 03 04");
    expect(dump(img.getRowBuffer(2))).toBe("00 01 02 03");
    expect(progressLog[0]).toEqual({ step: "read", value: 0, maxValue: 3 });
    expect(progressLog[1]).toEqual({ step: "read", value: 1, maxValue: 3 });
    expect(progressLog[3]).toEqual({ step: "read", value: 3, maxValue: 3 });
  });

  it("custom", async () => {
    function* interlaced(height: number) {
      for (let y = 0; y < height; y += 2) {
        yield y;
      }
      for (let y = 1; y < height; y += 2) {
        yield y;
      }
    }

    const img = SurfaceStd.create(4, 3, 8);
    const progressLog: ProgressInfo[] = [];
    const reader = new SurfaceReader(img, testProgress(progressLog));
    await readLoop({
      info: img.info,
      rowOrder: interlaced,
      reader,
      onRow,
    });
    expect(dump(img.getRowBuffer(0))).toBe("00 01 02 03");
    expect(dump(img.getRowBuffer(1))).toBe("02 03 04 05");
    expect(dump(img.getRowBuffer(2))).toBe("01 02 03 04");
  });
});
