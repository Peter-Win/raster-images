import { subBuffer } from "../utils";
import { PixelDepth } from "../types";
import { PixelFormat } from "../PixelFormat";
import { Palette } from "../Palette/Palette";
import { Variables } from "../ImageInfo/Variables";
import {
  ImageInfo,
  createInfoSign,
  fromParcelImageInfo,
  getImageLineSize,
  toParcelImageInfo,
} from "../ImageInfo";
import { Point } from "../math/Point";
import { ColorModel } from "../ColorModel";
import { Surface } from "./Surface";
import { ParcelSurface } from "./ParcelSurface";

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
      palette?: Readonly<Palette>;
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
      palette?: Readonly<Palette>;
      vars?: Variables;
      data?: Uint8Array;
    }
  ): SurfaceStd {
    return SurfaceStd.createSize(new Point(width, height), depth, params);
  }

  static createSign(
    width: number,
    height: number,
    signature: string,
    options?: {
      palette?: Palette;
      data?: Uint8Array;
    }
  ): SurfaceStd {
    const imgInfo: ImageInfo = createInfoSign(width, height, signature);
    if (options?.palette) imgInfo.fmt.setPalette(options?.palette);
    return new SurfaceStd(imgInfo, options?.data);
  }

  // Десериализация изображения, пересылаемого через postMessage
  static fromParcel({ info, data }: ParcelSurface): SurfaceStd {
    return new SurfaceStd(fromParcelImageInfo(info), data);
  }

  toParcel(): ParcelSurface {
    return {
      info: toParcelImageInfo(this.info),
      data: this.data,
    };
  }

  createDataView(): DataView {
    return new DataView(this.data.buffer, this.data.byteOffset);
  }

  getRowBuffer(y: number): Uint8Array {
    return subBuffer(this.data, this.getRowOffset(y), this.rowSize);
  }

  getRowBufferClamped(y: number): Uint8ClampedArray {
    return new Uint8ClampedArray(
      this.data.buffer,
      this.data.byteOffset + this.getRowOffset(y),
      this.rowSize
    );
  }

  fill(unsignedByte: number) {
    const buf = new Uint8Array(this.data.buffer, this.data.byteOffset);
    buf.fill(unsignedByte);
  }
}
