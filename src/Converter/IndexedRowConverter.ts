import { ImageInfo } from "../ImageInfo";
import { ErrorRI } from "../utils";
import { CvtDescriptorIndexed } from "../cvt/indexed/CvtDescriptorIndexed";
import { ImageReader } from "../transfer/ImageReader";
import { RowProxyReader } from "../transfer/RowProxyReader";
import { FnCvt } from "../cvt";
import { PixelFormat } from "../PixelFormat";
import { Converter } from "./Converter";

/* eslint "max-classes-per-file": "off" */

class IndexedRowProxyReader extends RowProxyReader {
  constructor(
    dstPixFmt: PixelFormat,
    nextReader: ImageReader,
    readonly descriptor: CvtDescriptorIndexed
  ) {
    const cvt: FnCvt = (width, srcBuf, srcOffset, dstBuf, dstOffset) =>
      this.descriptor.cvt(
        width,
        srcBuf,
        srcOffset,
        dstBuf,
        dstOffset,
        this.paletteCache
      );
    super(cvt, dstPixFmt, nextReader);
  }

  paletteCache: Uint8Array = new Uint8Array();

  async onStart(info: ImageInfo): Promise<void> {
    const { palette } = info.fmt;
    if (!palette)
      throw new ErrorRI("Palette expected in <src>", {
        src: info.fmt.signature,
      });
    this.paletteCache = this.descriptor.makePaletteCache(palette);
    await super.onStart(info);
  }
}

export class IndexedRowConverter implements Converter {
  constructor(
    readonly srcSign: string,
    readonly dstSign: string,
    readonly descriptor: CvtDescriptorIndexed
  ) {}

  createReader(nextReader: ImageReader): ImageReader {
    return new IndexedRowProxyReader(
      new PixelFormat(this.dstSign),
      nextReader,
      this.descriptor
    );
  }
}
