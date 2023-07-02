import { readPalette } from "../../Palette/readPalette";
import { ImageInfo, createInfo } from "../../ImageInfo";
import { ImageReader } from "../../transfer/ImageReader";
import { BitmapFrame } from "../BitmapFormat";
import { FormatGif } from "./FormatGif";
import {
  GifImageDescriptor,
  GifImgDescFlags,
  readGifImageDescriptor,
} from "./GifImageDescriptor";
import { calcGifTableSize } from "./calcGifTableSize";
import { ErrorRI } from "../../utils";
import { readByte, streamLock } from "../../stream";
import {
  FnRowOrder,
  rowOrderInterlaced,
  rowOrderNonInterlaced,
} from "./rowOrder";
import { skipGifData } from "./skipGifData";
import { LzwUnpacker } from "./lzw/LzwUnpacker";

export class FrameGif implements BitmapFrame {
  static async create(format: FormatGif): Promise<FrameGif> {
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

    await stream.skip(1);
    await skipGifData(stream);

    const endPos = await stream.getPos();
    return new FrameGif(format, info, startPos, endPos - startPos, descr);
  }

  readonly type = "frame";

  protected constructor(
    readonly format: FormatGif,
    readonly info: ImageInfo,
    readonly offset: number,
    readonly size: number,
    readonly descriptor: GifImageDescriptor
  ) {}

  async read(reader: ImageReader): Promise<void> {
    await streamLock(this.format.stream, async (stream) => {
      const { width, height, flags } = this.descriptor;
      const interleased = (flags & GifImgDescFlags.interlace) !== 0;
      const rowOrder: FnRowOrder = interleased
        ? rowOrderInterlaced
        : rowOrderNonInterlaced;
      const gen = rowOrder(height);
      await reader.onStart(this.info);
      await stream.seek(this.offset);
      const startCodeSize = await readByte(stream);
      const unpacker = new LzwUnpacker(stream, startCodeSize);
      for (let i = 0; i < height; i++) {
        const y = gen.next().value as number;
        const row = await reader.getRowBuffer(y);
        await unpacker.readLine(row, width);
        await reader.finishRow(y);
      }
      if (reader.onFinish) {
        await reader.onFinish();
      }
    });
  }
}
