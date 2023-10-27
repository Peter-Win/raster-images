import { Point } from "../math/Point";
import { PixelFormat } from "../PixelFormat";
import { ErrorRI } from "../utils";
import { fromParcelImageInfo, toParcelImageInfo } from "../ImageInfo";
import { Surface } from "./Surface";
import { ParcelSurface } from "./ParcelSurface";

/**
 * Using standard ImageData from Canvas as Surface
 */
export class SurfaceImageData extends Surface {
  constructor(public imageData: ImageData) {
    super({
      size: new Point(imageData.width, imageData.height),
      fmt: PixelFormat.canvas,
    });
  }

  getRowBuffer(y: number): Uint8Array {
    const { data } = this.imageData;
    return new Uint8Array(data.buffer, data.byteOffset + this.getRowOffset(y));
  }

  toParcel(): ParcelSurface {
    return {
      info: toParcelImageInfo(this.info),
      data: new Uint8Array(
        this.imageData.data.buffer,
        this.imageData.data.byteOffset
      ),
    };
  }

  static fromParcel(parcel: ParcelSurface): SurfaceImageData {
    const info = fromParcelImageInfo(parcel.info);
    if (!PixelFormat.canvas.equals(info.fmt)) {
      throw new ErrorRI("Unsupported pixel format <fmt> for ImageData", {
        fmt: info.fmt.signature,
      });
    }
    const { data } = parcel;
    return new SurfaceImageData(
      new ImageData(
        new Uint8ClampedArray(data.buffer, data.byteOffset),
        info.size.x,
        info.size.y
      )
    );
  }
}
