import { Converter } from "../../Converter";
import { ImageInfo } from "../../ImageInfo";
import { BitmapFormat, BitmapFrame } from "../BitmapFormat";
import { Ifd } from "./ifd/Ifd";
import { imageInfoFromIfd } from "./imageInfoFromIfd";
import { loadTiffImage } from "./loadTiffImage";

export class FrameTiff implements BitmapFrame {
  readonly type = "image"; // TODO: может зависеть от TiffTag.NewSubfileType

  static async create(format: BitmapFormat, littleEndian: boolean) {
    const { stream } = format;
    const offset = await stream.getPos();
    const ifd = new Ifd(littleEndian);
    const nextOffset = await ifd.load(stream);
    const info = await imageInfoFromIfd(ifd, stream);
    const frame = new FrameTiff(format, littleEndian, info, offset, ifd);
    return { frame, nextOffset };
  }

  protected constructor(
    public readonly format: BitmapFormat,
    public readonly littleEndian: boolean,
    public readonly info: ImageInfo,
    public readonly offset: number,
    public readonly ifd: Ifd
  ) {}

  async read(converter: Converter) {
    await loadTiffImage({
      ifd: this.ifd,
      stream: this.format.stream,
      info: this.info,
      converter,
    });
  }
}
