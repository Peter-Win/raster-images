import { PixelDepth } from "../types";
import { PixelFormat } from "../PixelFormat";
import { Palette } from "../Palette/Palette";
import { Variables } from "../ImageInfo/Variables";
import { ImageInfo, getImageLineSize } from "../ImageInfo";
import { Point } from "../math/Point";
import { ColorModel } from "../ColorModel";
import { Surface } from "./Surface";

/**
 * SurfaceStd use ArrayBuffer for pixel data
 */
export class SurfaceStd extends Surface {
  data: Uint8Array;

  constructor(imgInfo: ImageInfo, existsData?: Uint8Array) {
    super(imgInfo);
    this.info = imgInfo;
    this.data =
      existsData ??
      new Uint8Array(getImageLineSize(this.info) * this.info.size.y);
  }

  static createSize(
    size: Point,
    depth: PixelDepth,
    params?: {
      colorModel?: ColorModel;
      alpha?: boolean;
      palette?: Palette;
      vars?: Variables;
      data?: Uint8Array;
    }
  ): SurfaceStd {
    return new SurfaceStd(
      {
        size,
        fmt: new PixelFormat({
          depth,
          colorModel: params?.colorModel ?? "Auto",
          alpha: params?.alpha,
          palette: params?.palette,
        }),
        vars: params?.vars,
      },
      params?.data
    );
  }

  static create(
    width: number,
    height: number,
    depth: PixelDepth,
    params?: {
      colorModel?: ColorModel;
      alpha?: boolean;
      palette?: Palette;
      vars?: Variables;
      data?: Uint8Array;
    }
  ): SurfaceStd {
    return SurfaceStd.createSize(new Point(width, height), depth, params);
  }

  createDataView(): DataView {
    return new DataView(this.data.buffer, this.data.byteOffset);
  }

  getRowBuffer(y: number): Uint8Array {
    return new Uint8Array(this.data.buffer, this.getRowOffset(y), this.rowSize);
  }

  getRowBufferClamped(y: number): Uint8ClampedArray {
    return new Uint8ClampedArray(
      this.data.buffer,
      this.getRowOffset(y),
      this.rowSize
    );
  }

  fill(unsignedByte: number) {
    const buf = new Uint8Array(this.data);
    buf.fill(unsignedByte);
  }
}
