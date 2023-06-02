import { ImageInfo } from "../ImageInfo";
import { ErrorRI } from "../utils";
import { ImageReader } from "./ImageReader";
import { Surface } from "../Surface";
import { ImageWriter } from "./ImageWriter";

export class SurfaceReader implements ImageReader, ImageWriter {
  constructor(protected destination: Surface) {}

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
