import { ImageInfo, getImageLineSize } from "../ImageInfo";
import { Point } from "../math/Point";
import { ColorModel } from "../ColorModel";
import { Palette } from "../Palette";

/**
 * Surface = raster image
 * This name is used in order not to override the standard Image from WEB API
 */
export abstract class Surface {
  constructor(public info: ImageInfo) {}

  abstract getRowBuffer(y: number): Uint8Array;

  get width(): number {
    return this.info.size.x;
  }

  get height(): number {
    return this.info.size.y;
  }

  get colorModel(): ColorModel {
    return this.info.fmt.colorModel;
  }

  get palette(): Readonly<Palette> | undefined {
    return this.info.fmt.palette;
  }

  setPalette(newPalette: Readonly<Palette> | undefined) {
    this.info.fmt.setPalette(newPalette);
  }

  get bitsPerPixel() {
    return this.info.fmt.depth;
  }

  get size(): Point {
    return this.info.size;
  }

  get rowSize(): number {
    return getImageLineSize(this.info);
  }

  getRowOffset(y: number): number {
    return y * this.rowSize;
  }
}
