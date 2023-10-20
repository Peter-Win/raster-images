import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { FormatBmp } from "../FormatBmp";
import { FrameBmp } from "../FrameBmp";
import { bmpFileHeaderSize } from "../BmpFileHeader";
import { bmpInfoHeaderSize } from "../BmpInfoHeader";
import { readUncompressedImage } from "../readUncompressedImage";
import { testProgress } from "../../../tests/testProgress";
import { ProgressInfo } from "../../../Converter/ProgressInfo";
import { Converter } from "../../../Converter";

describe("readUncompressedImage", () => {
  it("B8G8R8 upToDown", async () => {
    await onStreamFromGallery("B8G8R8.bmp", async (stream) => {
      const fmt: FormatBmp = await FormatBmp.create(stream);
      expect(fmt.frames.length).toBe(1);
      const fr: FrameBmp = fmt.frames[0]!;
      const { info, isUpDown } = fr;
      expect(info.size).toEqual({ x: 9, y: 7 });
      expect(info.fmt.signature).toBe("B8G8R8");
      expect(info.fmt.depth).toBe(24);
      expect(info.fmt.colorModel).toBe("RGB");
      expect(fr.type).toBe("image");
      expect(fr.offset).toBe(bmpFileHeaderSize + bmpInfoHeaderSize);
      expect(isUpDown).toBe(true);
      type TRow = {
        y: number;
        row: Uint8Array;
      };
      const rows: TRow[] = [];

      const progressLog: ProgressInfo[] = [];
      const converter: Converter = {
        async getRowsWriter() {
          return {
            getBuffer: async (y: number) => {
              const row = new Uint8Array(9 * 3);
              rows.push({ y, row });
              return row;
            },
            flushBuffer: async () => {},
            finish: async () => {},
          };
        },
        async getRowsReader() {
          throw Error("Not implemented");
        },
        async getSurface() {
          throw Error("Not implemented");
        },
        progress: testProgress(progressLog),
      };
      await stream.seek(fr.offset);
      await readUncompressedImage({ stream, converter, info, isUpDown });
      expect(rows.length).toBe(7);
      expect(rows[0]!.y).toBe(0);
      expect(rows[1]!.y).toBe(1);
      expect(Array.from(rows[0]!.row)).toEqual([
        128,
        128,
        128, // 0
        0,
        0,
        0, // 1
        0,
        0,
        0, // 2
        0,
        0,
        0, // 3
        0,
        0,
        0, // 4
        0,
        0,
        0, // 5
        0,
        0,
        0, // 6
        0,
        0,
        0, // 7
        255,
        255,
        255, // 8
      ]);
      expect(Array.from(rows[1]!.row)).toEqual([
        0,
        0,
        0, // 0
        255,
        255,
        255, // 1
        255,
        255,
        255, // 2
        255,
        255,
        255, // 3
        255,
        255,
        255, // 4
        255,
        255,
        255, // 5
        255,
        255,
        255, // 6
        255,
        255,
        255, // 7
        0,
        0,
        0, // 8
      ]);
      expect(Array.from(rows[5]!.row)).toEqual([
        0,
        0,
        0, // 0
        255,
        255,
        255, // 1
        0,
        0,
        255, // 2
        255,
        255,
        255, // 3
        0,
        255,
        0, // 4
        255,
        255,
        255, // 5
        255,
        0,
        0, // 6
        255,
        255,
        255, // 7
        0,
        0,
        0,
      ]);
      const maxValue = info.size.y;
      expect(progressLog[0]).toEqual({
        step: "read",
        value: 0,
        y: 0,
        maxValue,
        init: true,
      });
      expect(progressLog.at(-1)).toEqual({
        step: "read",
        value: maxValue,
        y: maxValue,
        maxValue,
      });
    });
  });

  it("RGBA 32 down to up", async () => {
    await onStreamFromGallery("B8G8R8A8.bmp", async (stream) => {
      const fmt: FormatBmp = await FormatBmp.create(stream);
      expect(fmt.frames.length).toBe(1);
      const fr: FrameBmp = fmt.frames[0]!;
      const { info, isUpDown } = fr;
      expect(info.size).toEqual({ x: 9, y: 7 });
      expect(info.fmt.signature).toBe("B8G8R8A8");
      expect(info.fmt.depth).toBe(32);
      expect(info.fmt.colorModel).toBe("RGB");
      expect(fr.type).toBe("image");
      expect(fr.offset).toBe(bmpFileHeaderSize + bmpInfoHeaderSize);
      expect(isUpDown).toBe(false);
      type TRow = {
        y: number;
        row: Uint8Array;
      };
      const rows: TRow[] = [];

      const converter: Converter = {
        async getRowsWriter() {
          return {
            getBuffer: async (y: number) => {
              const row = new Uint8Array(9 * 4);
              rows.push({ y, row });
              return row;
            },
            flushBuffer: async () => {},
            finish: async () => {},
          };
        },
        async getRowsReader() {
          throw Error("Not implemented");
        },
        async getSurface() {
          throw Error("Not implemented");
        },
      };
      await stream.seek(fr.offset);
      await readUncompressedImage({ stream, converter, info, isUpDown });
      expect(rows.length).toBe(7);
      expect(rows[0]!.y).toBe(6);
      expect(rows[1]!.y).toBe(5);
      const row0 = Array.from(rows[0]!.row);
      expect(row0.slice(0, 4)).toEqual([128, 128, 128, 0]);
      const row6 = Array.from(rows[6]!.row);
      expect(row6.slice(0, 4)).toEqual([2, 3, 4, 0]);
    });
  });
});
