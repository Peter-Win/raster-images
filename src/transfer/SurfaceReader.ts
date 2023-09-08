import { ImageInfo } from "../ImageInfo";
import { ErrorRI } from "../utils";
import { ImageReader } from "./ImageReader";
import { Surface } from "../Surface";
import { ImageWriter } from "./ImageWriter";
import { OnProgressInfo } from "./ProgressInfo";

export class SurfaceReader implements ImageReader, ImageWriter {
  constructor(
    protected destination: Surface,
    public readonly progress?: OnProgressInfo
  ) {}

  async onStart(info: ImageInfo): Promise<void> {
    const { size, fmt } = this.destination.info;
    if (!info.size.equals(size))
      throw new ErrorRI(
        "Frame and image are not the same size. Src: <src>, Dst: <dst>",
        {
          src: info.size.toString(),
          dst: size.toString(),
        }
      );
    // Для случая когда нужно передать палитру от исходного формата в конечное изображение. Пока такой костыль.
    // Используется например в случае чтения I1 в I8
    if (info.fmt.palette && !fmt.palette) {
      fmt.setPalette(info.fmt.palette);
    }
    if (!info.fmt.equals(fmt))
      throw new ErrorRI("Incompatible pixel formats. Src: <src>, Dst: <dst>", {
        src: info.fmt.signature,
        dst: fmt.signature,
      });
  }

  async getRowBuffer(y: number): Promise<Uint8Array> {
    return this.destination.getRowBuffer(y);
  }

  async finishRow(_: number): Promise<void> {}
}
