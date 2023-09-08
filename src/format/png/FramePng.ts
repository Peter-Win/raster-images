import pako from "pako";
import { BitmapFormat, BitmapFrame, FrameType } from "../BitmapFormat";
import { isEndOfStream, streamLock } from "../../stream";
import { ImageInfo } from "../../ImageInfo";
import { ImageReader } from "../../transfer/ImageReader";
import {
  PngChunkRef,
  readPngChunkDataOnly,
  readPngChunkRef,
} from "./PngChunkRef";
import { checkPngSignature } from "./checkPngSignature";
import { ErrorRI } from "../../utils";
import { PngChunkType } from "./PngChunkType";
import { readPngHeader } from "./chunks/PngHeader";
import { readPaletteFromBuf } from "../../Palette/readPalette";
import { PixelFormat } from "../../PixelFormat";
import { PixelFormatDef } from "../../PixelFormat/PixelFormatDef";
import { calcPitch } from "../../ImageInfo/calcPitch";
import { copyBytes } from "../../cvt/copy/copyBytes";
import { PixelFillerCtx } from "../../draw/PixelFiller/PixelFiller";
import { createPixelFiller } from "../../draw/PixelFiller/createPixelFiller";
import { SurfaceStd } from "../../Surface";
import { copyWordsFromBigEndian } from "../../cvt/copy/copyWordsFromBigEndian";
import { PngRowFiltrator } from "./PngRowFiltrator";
import { readPngInternationalText, readPngText } from "./chunks/PngText";
import { ProgressInfo } from "../../transfer/ProgressInfo";

export class FramePng implements BitmapFrame {
  readonly type: FrameType = "image";

  static async create(format: BitmapFormat): Promise<FramePng> {
    return streamLock(format.stream, async (stream) => {
      const isPng: boolean = await checkPngSignature(stream);
      if (!isPng) throw new ErrorRI("Not PNG file");
      const chunks: PngChunkRef[] = [];
      let info: ImageInfo | undefined;
      let offset = 0;
      let comment = "";
      const defaultHandler = async (chunk: PngChunkRef) => {
        await stream.seek(chunk.nextChunkPosition);
      };
      const handlers: Partial<
        Record<PngChunkType, (chunk: PngChunkRef) => Promise<void>>
      > = {
        IHDR: async (chunk) => {
          const data = await readPngChunkDataOnly(stream, chunk);
          info = readPngHeader(data);
        },
        PLTE: async (chunk) => {
          const data = await readPngChunkDataOnly(stream, chunk);
          const pal = readPaletteFromBuf(data, data.byteLength / 3, {
            rgb: true,
          });
          info?.fmt.setPalette(pal);
        },
        tRNS: async (chunk) => {
          const data = await readPngChunkDataOnly(stream, chunk);
          const def = info?.fmt.def;
          if (
            def?.palette?.length === data.length &&
            def.colorModel === "Indexed"
          ) {
            const newDef: PixelFormatDef = {
              ...def,
              alpha: true,
              palette: def.palette.map(([b, g, r], i) => [b, g, r, data[i]!]),
            };
            info!.fmt = new PixelFormat(newDef);
          }
        },
        IDAT: async (chunk) => {
          offset = offset || chunk.dataPosition - 8;
          await defaultHandler(chunk);
        },
        tEXt: async (chunk) => {
          const data = await readPngChunkDataOnly(stream, chunk);
          const rec = readPngText(data);
          if (rec.keyword === "Comment") {
            comment = rec.text;
          }
        },
        iTXt: async (chunk) => {
          const data = await readPngChunkDataOnly(stream, chunk);
          const rec = readPngInternationalText(data);
          if (rec.keyword === "Comment") {
            comment = rec.text;
          }
        },
      };
      while (!(await isEndOfStream(stream))) {
        const chunk = await readPngChunkRef(stream);
        chunks.push(chunk);
        if (chunk.type === "IEND") break;
        const handler = handlers[chunk.type] ?? defaultHandler;
        await handler(chunk);
      }
      if (!info) {
        throw new ErrorRI("Expected IHDR chunk");
      }
      if (!offset) {
        throw new ErrorRI("Expected IDAT chunk");
      }
      if (comment) {
        info.vars = info.vars || {};
        info.vars.comment = comment;
      }
      return new FramePng(format, info, offset, chunks);
    });
  }

  protected constructor(
    public readonly format: BitmapFormat,
    public readonly info: ImageInfo,
    public readonly offset: number, // position of the first IDAT chunk
    public readonly chunks: PngChunkRef[]
  ) {}

  async read(reader: ImageReader): Promise<void> {
    await streamLock(this.format.stream, async (stream) => {
      const { info } = this;
      const is16bit = info.fmt.samples[0]?.length === 16;
      await stream.seek(this.offset);
      // Нужно передать все данные в inflator. Только тогда он выдаст результат.
      // Это не очень хорошо, т.к. происходит выделение лишней памяти.
      // в то время как в zlib можно указать целевой буфер, что значительно сокращает издержки по пересылке данных
      const inflator = new pako.Inflate();
      for (;;) {
        const chunk = await readPngChunkRef(stream);
        if (chunk.type !== "IDAT") break;
        const pkData = await readPngChunkDataOnly(stream, chunk);
        inflator.push(pkData);
      }
      const unpkData = inflator.result;
      if (typeof unpkData === "string") {
        throw new ErrorRI("Corrupted data");
      }
      let unpkPos = 0;

      await reader.onStart(info);
      const { x: width, y: height } = info.size;

      const srcPitch = calcPitch(width, info.fmt.depth);
      const pixelSize = calcPitch(1, info.fmt.depth);
      const filtrator = new PngRowFiltrator(pixelSize, srcPitch);

      if (!info.vars?.interlaced) {
        const pi: ProgressInfo = { step: "read", value: 0, maxValue: height };
        for (let y = 0; y < height; y++) {
          if (reader.progress) {
            pi.value = y;
            await reader.progress(pi);
          }
          const row = await reader.getRowBuffer(y);

          const filterType = unpkData[unpkPos++]!;
          const [curLine, curLineOffs] = filtrator.unfilterRow(
            filterType,
            unpkData,
            unpkPos,
            srcPitch
          );
          if (is16bit) {
            copyWordsFromBigEndian(
              srcPitch >> 1,
              curLine.buffer,
              curLine.byteOffset + curLineOffs,
              row.buffer,
              row.byteOffset
            );
          } else {
            copyBytes(srcPitch, curLine, curLineOffs, row, 0);
          }
          filtrator.next();
          await reader.finishRow(y);
          unpkPos += srcPitch;
        }
        if (reader.progress) {
          pi.value = height;
          await reader.progress(pi);
        }
      } else {
        const tmpSurface = new SurfaceStd(info);
        // TODO: пока без прогресса
        for (let pass = 0; pass < 7; pass++) {
          const dx = colIncrement[pass]!;
          const pixCnt = Math.floor((width - startingCol[pass]! + dx - 1) / dx);
          // eslint-disable-next-line no-continue
          if (pixCnt === 0) continue;
          const subLineSize = calcPitch(pixCnt, info.fmt.depth);
          for (
            let y = startingRow[pass]!;
            y < height;
            y += rowIncrement[pass]!
          ) {
            const filterType = unpkData[unpkPos++]!;
            const [curLine, curLineOffs] = filtrator.unfilterRow(
              filterType,
              unpkData,
              unpkPos,
              subLineSize
            );

            const dstRow = tmpSurface.getRowBuffer(y);
            const ctx: PixelFillerCtx = {
              src: curLine,
              srcOffset: curLineOffs,
              dst: dstRow,
            };
            const filler = createPixelFiller(info.fmt);
            let k = 0;
            for (let x = startingCol[pass]!; x < width; x += dx) {
              filler(ctx, k++, x);
            }
            unpkPos += subLineSize;
            filtrator.next();
          }
        }
        for (let y = 0; y < height; y++) {
          const src = tmpSurface.getRowBuffer(y);
          const dst = await reader.getRowBuffer(y);
          if (is16bit) {
            copyWordsFromBigEndian(
              tmpSurface.rowSize / 2,
              src.buffer,
              src.byteOffset,
              dst.buffer,
              dst.byteOffset
            );
          } else {
            copyBytes(tmpSurface.rowSize, src, 0, dst, 0);
          }
          if (reader.finishRow) {
            await reader.finishRow(y);
          }
        }
      }
      if (reader.onFinish) {
        await reader.onFinish();
      }
    });
  }
}

// see https://www.w3.org/TR/2003/REC-PNG-20031110/#13Progressive-display
const startingRow = [0, 0, 4, 0, 2, 0, 1] as const;
const startingCol = [0, 4, 0, 2, 0, 1, 0] as const;
const rowIncrement = [8, 8, 8, 4, 4, 2, 2] as const;
const colIncrement = [8, 8, 4, 4, 2, 2, 1] as const;
