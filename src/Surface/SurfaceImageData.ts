import { Point } from "../math/Point";
import { Surface } from "./Surface";
import { PixelFormat } from "../PixelFormat";

export class SurfaceImageData extends Surface {
  constructor(protected imageData: ImageData) {
    super({
      size: new Point(imageData.width, imageData.height),
      fmt: PixelFormat.canvas,
    });
  }

  getRowBuffer(y: number): Uint8Array {
    const { data } = this.imageData;
    return new Uint8Array(data.buffer, data.byteOffset + this.getRowOffset(y));
  }
}
