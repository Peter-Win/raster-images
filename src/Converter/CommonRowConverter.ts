import { ImageReader } from "../transfer/ImageReader";
import { CvtDescriptor, FnCvt } from "../cvt";
import { Converter } from "./Converter";
import { PixelFormat } from "../PixelFormat";
import { RowProxyReader } from "../transfer/RowProxyReader";

export class CommonRowConverter implements Converter {
  constructor(
    readonly srcSign: string,
    readonly dstSign: string,
    readonly descriptor: CvtDescriptor,
    readonly cvt: FnCvt
  ) {}

  createReader(nextReader: ImageReader): ImageReader {
    return new RowProxyReader(
      this.cvt,
      new PixelFormat(this.dstSign),
      nextReader
    );
  }
}
