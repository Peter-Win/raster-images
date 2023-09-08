import { readPalette } from "../../Palette/readPalette";
import { ImageInfo, createInfo } from "../../ImageInfo";
import { ImageReader } from "../../transfer/ImageReader";
import { BitmapFrame } from "../BitmapFormat";
import { FormatGif } from "./FormatGif";
import {
  GifImageDescriptor,
  GifImgDescFlags,
  gifInterlaced,
  readGifImageDescriptor,
} from "./GifImageDescriptor";
import { calcGifTableSize } from "./calcGifTableSize";
import { ErrorRI } from "../../utils";
import { readByte, streamLock } from "../../stream";
import { FnRowOrder, rowOrderForward } from "../../transfer/rowOrder";
import { gifRowOrderInterlaced } from "./gifRowOrderInterlaced";
import { skipGifData } from "./skipGifData";
import { LzwUnpacker } from "./lzw/LzwUnpacker";
import { GraphicControlExtension } from "./GraphicControlExtension";
import { readLoop } from "../../transfer/readLoop";

export class FrameGif implements BitmapFrame {
  static async create(
    format: FormatGif,
    graphicControlExtension: GraphicControlExtension | undefined
  ): Promise<FrameGif> {
    const { stream, frames } = format;
    const frameIndex = frames.length;
    const descr = await readGifImageDescriptor(stream);
    const { left, top, width, height, flags } = descr;
    const tableSize = calcGifTableSize(flags & GifImgDescFlags.tableSize);
    const palette =
      (flags & GifImgDescFlags.localTable) !== 0
        ? await readPalette(stream, tableSize, { rgb: true })
        : format.palette;
    if (!palette) {
      throw new ErrorRI("Color table is not defined for frame #<n> of <src>", {
        n: frameIndex + 1,
        src: stream.name,
      });
    }
    const startPos = await stream.getPos();

    const info: ImageInfo = createInfo(
      width,
      height,
      8,
      "Indexed",
      false,
      palette
    );
    info.vars = {
      orgX: left,
      orgY: top,
    };
    if (gifInterlaced(flags)) {
      info.vars.interlaced = 1;
    }

    await stream.skip(1);
    await skipGifData(stream);

    // TODO: Возможно, нет смысла искать конец фрейма. Это потеря производительности. А смысла особого в этом нет.
    const endPos = await stream.getPos();
    return new FrameGif(
      format,
      info,
      startPos,
      endPos - startPos,
      descr,
      graphicControlExtension
    );
  }

  readonly type = "frame";

  protected constructor(
    readonly format: FormatGif,
    readonly info: ImageInfo,
    readonly offset: number,
    readonly size: number,
    readonly descriptor: GifImageDescriptor,
    readonly graphicControlExtension: GraphicControlExtension | undefined
  ) {}

  get interleased(): boolean {
    return gifInterlaced(this.descriptor.flags);
  }

  async read(reader: ImageReader): Promise<void> {
    await streamLock(this.format.stream, async (stream) => {
      const { width } = this.descriptor;
      const { interleased } = this;
      const rowOrder: FnRowOrder = interleased
        ? gifRowOrderInterlaced
        : rowOrderForward;
      await reader.onStart(this.info);
      await stream.seek(this.offset);
      const startCodeSize = await readByte(stream);
      const unpacker = new LzwUnpacker(stream, startCodeSize);
      await readLoop({
        info: this.info,
        rowOrder,
        reader,
        async onRow(row: Uint8Array) {
          await unpacker.readLine(row, width);
        },
      });
    });
  }
}
