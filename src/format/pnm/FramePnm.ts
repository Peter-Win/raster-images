import { streamLock } from "../../stream";
import { ImageInfo } from "../../ImageInfo";
import { BitmapFormat, BitmapFrame } from "../BitmapFormat";
import { PnmReader } from "./PnmReader";
import { pnmDescriptions } from "./pnmCommon";
import { ErrorRI } from "../../utils";
import { Point } from "../../math/Point";
import { PixelFormat } from "../../PixelFormat";
import { asciiNumber, checkInterval } from "./asciiNumber";
import {
  PnmRowReader,
  pbmRowReaderPlain,
  pbmRowReaderRaw,
  pnmRowReaderGray,
  pnmRowReaderGrayFloat,
  pnmRowReaderRgb,
  pnmRowReaderRgbFloat,
} from "./PnmRowReader";
import { Converter, readImage } from "../../Converter";

export class FramePnm implements BitmapFrame {
  static async create(format: BitmapFormat): Promise<FramePnm> {
    return streamLock(format.stream, async (stream) => {
      const pnmReader = new PnmReader(stream);
      const curSign: string = await pnmReader.readString();
      const descr = pnmDescriptions.find(({ sign }) => sign === curSign);
      if (!descr) {
        throw new ErrorRI("Unsupported signature (<s>)", { s: curSign });
      }
      const width: number = asciiNumber(await pnmReader.readString(), "width");
      const height: number = asciiNumber(
        await pnmReader.readString(),
        "height"
      );
      let maxVal = 1;
      const { isFloat } = descr;
      if (descr.fmt === "graymap" || descr.fmt === "pixmap") {
        maxVal = asciiNumber(await pnmReader.readString(), "max value");
        if (!isFloat) {
          checkInterval("Max value", maxVal, 0xffff, 1);
        }
      }
      let colorSign: string = "";
      let ext = "";
      let rowReader: PnmRowReader = async () => {};
      switch (descr.fmt) {
        case "bitmap":
          colorSign = "G1";
          ext = "pbm";
          rowReader =
            descr.type === "plain"
              ? pbmRowReaderPlain(stream)
              : pbmRowReaderRaw(stream);
          break;
        case "graymap":
          ext = "pgm";
          if (isFloat) {
            colorSign = "G32";
            rowReader = pnmRowReaderGrayFloat(stream, maxVal);
          } else {
            colorSign = maxVal < 256 ? "G8" : "G16";
            rowReader = pnmRowReaderGray(descr.type, stream, maxVal);
          }
          break;
        case "pixmap":
          ext = "ppm";
          if (isFloat) {
            colorSign = "R32G32B32";
            rowReader = pnmRowReaderRgbFloat(stream, maxVal);
          } else {
            colorSign = maxVal < 256 ? "R8G8B8" : "R16G16B16";
            rowReader = pnmRowReaderRgb(descr.type, stream, maxVal);
          }
          break;
        default:
          throw new ErrorRI("Invalid type [<t>]", { t: descr.fmt });
      }
      const info: ImageInfo = {
        size: new Point(width, height),
        fmt: new PixelFormat(colorSign),
        vars: {
          mapType: descr.fmt,
          dataType: descr.type,
          ext,
          maxVal,
        },
      };

      const pixelDataOffset = await stream.getPos();

      return new FramePnm(format, info, pixelDataOffset, maxVal, rowReader);
    });
  }

  readonly type = "image";

  protected constructor(
    public readonly format: BitmapFormat,
    public readonly info: ImageInfo,
    public readonly offset: number,
    public readonly maxValue: number,
    public readonly rowReader: PnmRowReader
  ) {}

  read(converter: Converter): Promise<void> {
    const { stream } = this.format;
    return streamLock(stream, async () => {
      const { info, offset, rowReader } = this;
      await stream.seek(offset);
      const width = info.size.x;
      const onRow = async (row: Uint8Array) => {
        await rowReader(width, row);
      };
      await readImage(converter, info, onRow);
    });
  }
}
