import { PixelFormat } from "../PixelFormat";
import { calcPitch } from "../ImageInfo/calcPitch";
import { FnCvt } from "../cvt";
import { ImageReader } from "./ImageReader";
import { ImageInfo } from "../ImageInfo";
import { OnProgressInfo } from "./ProgressInfo";

export class RowProxyReader implements ImageReader {
  rowBuffer: Uint8Array;

  width = 0;

  constructor(
    protected cvt: FnCvt,
    protected dstPixFmt: PixelFormat,
    protected nextReader: ImageReader,
    public readonly progress?: OnProgressInfo
  ) {
    this.rowBuffer = new Uint8Array();
  }

  onStart(info: ImageInfo): Promise<void> {
    this.width = info.size.x;
    this.rowBuffer = new Uint8Array(calcPitch(info.size.x, info.fmt.depth));
    return this.nextReader.onStart({
      ...info,
      fmt: this.dstPixFmt,
    });
  }

  async onFinish(): Promise<void> {
    if (this.nextReader.onFinish) {
      await this.nextReader?.onFinish();
    }
  }

  async getRowBuffer(): Promise<Uint8Array> {
    return this.rowBuffer;
  }

  async finishRow(y: number): Promise<void> {
    const src = this.rowBuffer;
    const dst = await this.nextReader.getRowBuffer(y);
    this.cvt(
      this.width,
      src.buffer,
      src.byteOffset,
      dst.buffer,
      dst.byteOffset
    );
    await this.nextReader.finishRow(y);
  }
}
