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

export class FramePng implements BitmapFrame {
  readonly type: FrameType = "image";

  static async create(format: BitmapFormat): Promise<FramePng> {
    return streamLock(format.stream, async (stream) => {
      const isPng: boolean = await checkPngSignature(stream);
      if (!isPng) throw new ErrorRI("Not PNG file");
      const chunks: PngChunkRef[] = [];
      let info: ImageInfo | undefined;
      let offset = 0;
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
          offset = chunk.dataPosition - 8;
          await defaultHandler(chunk);
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
      return new FramePng(format, info, offset, chunks);
    });
  }

  protected constructor(
    public readonly format: BitmapFormat,
    public readonly info: ImageInfo,
    public readonly offset: number, // position of the first IDAT chunk
    public readonly chunks: PngChunkRef[]
  ) {}

  read(_reader: ImageReader): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
