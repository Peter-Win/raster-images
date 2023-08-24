import { ImageReader } from "../transfer/ImageReader";
import { CvtDescriptorDirect } from "../cvt";
import { CommonRowConverter } from "./CommonRowConverter";
import { RowProxyReader } from "../transfer/RowProxyReader";
import { PixelFormat } from "../PixelFormat";
import { ImageInfo } from "../ImageInfo";

/* eslint "max-classes-per-file": "off" */

export class PaletteShareConverter extends CommonRowConverter {
  constructor(
    readonly srcSign: string,
    readonly dstSign: string,
    readonly descriptor: CvtDescriptorDirect
  ) {
    super(srcSign, dstSign, descriptor, descriptor.cvt);
  }

  createReader(nextReader: ImageReader): ImageReader {
    return new PaletteShareRowProxyReader(
      this.cvt,
      new PixelFormat(this.dstSign),
      nextReader
    );
  }
}

class PaletteShareRowProxyReader extends RowProxyReader {
  onStart(info: ImageInfo): Promise<void> {
    this.dstPixFmt.setPalette(info.fmt.palette);
    return super.onStart(info);
  }
}
