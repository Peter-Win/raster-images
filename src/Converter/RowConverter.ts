import { ImageReader } from "../transfer/ImageReader";
import { CvtDescriptorDirect } from "../cvt";
import { Converter } from "./Converter";
import { PixelFormat } from "../PixelFormat";
import { RowProxyReader } from "../transfer/RowProxyReader";

export class RowConverter implements Converter {
  constructor(
    readonly srcSign: string,
    readonly dstSign: string,
    readonly descriptor: CvtDescriptorDirect
  ) {}

  createReader(nextReader: ImageReader): ImageReader {
    return new RowProxyReader(
      this.descriptor.cvt,
      new PixelFormat(this.dstSign),
      nextReader
    );
  }
}
