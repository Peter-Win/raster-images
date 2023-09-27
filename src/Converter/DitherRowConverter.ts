import { createFloydSteinberg8 } from "../cvt/dithering/FloydSteinberg";
import { CvtDescriptorDither } from "../cvt/CvtDescriptorDither";
import { Converter } from "./Converter";
import { ImageReader } from "../transfer/ImageReader";
import { RowProxyReader } from "../transfer/RowProxyReader";
import { PixelFormat } from "../PixelFormat";
import { FnCvt } from "../cvt";
import { ImageInfo } from "../ImageInfo";

/* eslint "max-classes-per-file": "off" */

class DitherRowProxyReader extends RowProxyReader {
  constructor(
    dstPixFmt: PixelFormat,
    nextReader: ImageReader,
    readonly descriptor: CvtDescriptorDither
  ) {
    // пока что заглушка. настоящая фукция может быть получена в onStart
    const cvt: FnCvt = () => {};
    super(cvt, dstPixFmt, nextReader);
  }

  async onStart(info: ImageInfo): Promise<void> {
    const ctx = createFloydSteinberg8(info.size.x, 0);
    this.cvt = (
      width: number,
      srcBuf: ArrayBuffer,
      srcByteOffset: number,
      dstBuf: ArrayBuffer,
      dstByteOffset: number
    ) =>
      this.descriptor.cvt(
        width,
        srcBuf,
        srcByteOffset,
        dstBuf,
        dstByteOffset,
        ctx
      );
    await super.onStart(info);
  }
}

export class DitherRowConverter implements Converter {
  constructor(
    readonly srcSign: string,
    readonly dstSign: string,
    readonly descriptor: CvtDescriptorDither
  ) {}

  createReader(nextReader: ImageReader): ImageReader {
    return new DitherRowProxyReader(
      new PixelFormat(this.dstSign),
      nextReader,
      this.descriptor
    );
  }
}
