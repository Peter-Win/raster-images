import { Converter, readImage } from "../../Converter";
import { ImageInfo, getImageLineSize, getSizeAndDepth } from "../../ImageInfo";
import { streamLock } from "../../stream";
import { BitmapFormat, BitmapFrame } from "../BitmapFormat";
import { OptionsTarga } from "./OptionsTarga";
import { readTargaHeader } from "./TargaHeader";
import { targaHeaderAnalyze } from "./targaHeaderAnalyze";
import { readTargaPalette } from "./targaPalette";
import { stdRowOrder } from "../../Converter/rowOrder";
import { calcPitch } from "../../ImageInfo/calcPitch";
import { rleUnpack } from "./rleUnpack";
import { reverseRow } from "./reverseRow";
import { readTargaFooter } from "./TargaFooter";
import { TargaExtensionArea, readTargaExtensionArea } from "./extensionArea";

export class FrameTarga implements BitmapFrame {
  static async create(format: BitmapFormat): Promise<FrameTarga> {
    return streamLock(format.stream, async (stream) => {
      await stream.seek(0);
      const hd = await readTargaHeader(stream);
      if (hd.idLength) {
        await stream.skip(hd.idLength);
      }
      const { info, options } = targaHeaderAnalyze(hd);
      const palette = await readTargaPalette(stream, hd);
      info.fmt.setPalette(palette);
      const offset = await stream.getPos();
      const footer = await readTargaFooter(stream);
      // Developer area not supported yet.
      let extArea: TargaExtensionArea | undefined;
      if (footer?.extensionAreaOffset) {
        await stream.seek(footer.extensionAreaOffset);
        extArea = await readTargaExtensionArea(stream);
      }
      return new FrameTarga(format, info, offset, options, extArea);
    });
  }

  readonly type = "image";

  protected constructor(
    public readonly format: BitmapFormat,
    public readonly info: ImageInfo,
    public readonly offset: number,
    public readonly options: OptionsTarga,
    public readonly extArea?: TargaExtensionArea
  ) {}

  async read(converter: Converter): Promise<void> {
    const { stream } = this.format;
    const { top2bottom } = this.options;
    const rowOrder = stdRowOrder(top2bottom ? "forward" : "backward");
    const rowSize = getImageLineSize(this.info);
    const { width, depth } = getSizeAndDepth(this.info);
    const bytesPerPixel = calcPitch(1, depth);

    return streamLock(stream, async () => {
      await stream.seek(this.offset);

      let fillRow: (row: Uint8Array) => Promise<void>;
      if (!this.options.compression) {
        fillRow = async (row: Uint8Array) => {
          await stream.readBuffer(row, rowSize);
        };
      } else {
        const size = await stream.getSize();
        const buffer = await stream.read(size - this.offset);
        const unpack = rleUnpack(width, buffer, bytesPerPixel);
        fillRow = async (row: Uint8Array) => {
          unpack(row);
        };
      }
      if (this.options.right2left) {
        const ltr = fillRow;
        fillRow = async (row) => {
          await ltr(row);
          reverseRow(width, row, bytesPerPixel);
        };
      }
      await readImage(converter, this.info, fillRow, rowOrder);
    });
  }
}
