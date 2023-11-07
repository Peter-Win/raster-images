import { readDwordLE } from "../../stream";
import { Converter } from "../../Converter";
import { ImageInfo } from "../../ImageInfo";
import { BitmapFormat, BitmapFrame } from "../BitmapFormat";
import { bmpSignature, readBmpFileHeader } from "./BmpFileHeader";
import { Variables } from "../../ImageInfo/Variables";
import { ErrorRI } from "../../utils";
import { Point } from "../../math/Point";
import { readBmpCoreHeaderFromBuffer } from "./BmpCoreHeader";
import { PixelFormatDef } from "../../PixelFormat/PixelFormatDef";
import { PixelDepth } from "../../types";
import { PixelFormat } from "../../PixelFormat";
import { readPalette } from "../../Palette/readPalette";
import {
  BmpCompression,
  getBmpCompressionName,
  readBmpInfoHeaderFromBuffer,
} from "./BmpInfoHeader";
import { onInvalidFormat } from "../onInvalidFormat";
import { driverBmp } from "./driverBmp";
import { readUncompressedImage } from "./readUncompressedImage";
import { readRleImage } from "./rle/readRleImage";
import { bmpOs2 } from "./bmpCommon";
import { streamLock } from "../../stream/streamLock";

type HeaderType = "os2" | "std" | "v3";
const headerSizes: Record<number, HeaderType> = {
  12: "os2",
  64: "os2",
  56: "v3",
};

export class FrameBmp implements BitmapFrame {
  readonly type = "image";

  protected constructor(
    public readonly format: BitmapFormat,
    public readonly info: ImageInfo,
    public readonly offset: number,
    public readonly size: number,
    public readonly isUpDown: boolean,
    public readonly compression: number
  ) {}

  static create(format: BitmapFormat): Promise<FrameBmp> {
    const { stream } = format;
    return streamLock<FrameBmp>(stream, async () => {
      await stream.seek(0);
      const vars: Variables = {
        ext: driverBmp.extensions[0]!,
        name: driverBmp.name,
      };
      let upDown = false;
      let compression = BmpCompression.RGB;
      const fhd = await readBmpFileHeader(stream);
      if (fhd.bfType !== bmpSignature) {
        onInvalidFormat(driverBmp.name, stream.name);
      }
      const biSize = await readDwordLE(stream);
      await stream.skip(-4);
      const hdType = headerSizes[biSize] || "std";
      // if (!hdType)
      //   throw new ErrorRI("Unknown image header size <size> bytes", {
      //     size: biSize,
      //   });
      // Здесь важно читать заголовок из буфера, т.к. размер заголовка может быть разным.
      // Если читать только нужные поля, то надо как-то перемещать указатель чтения на начало следующего блока.
      const ihd = await stream.read(biSize);
      const size = new Point();
      const pxDef: PixelFormatDef = {
        colorModel: "Auto",
        depth: 0,
      };
      let signature = "";
      const frameSize = fhd.bfSize - fhd.bfOffBits;
      if (hdType === "os2") {
        const hd = readBmpCoreHeaderFromBuffer(ihd);
        const bpp = hd.bcBitCount;
        size.set(hd.bcWidth, hd.bcHeight);
        if (bpp === 1 || bpp === 4 || bpp === 8) {
          pxDef.colorModel = "Indexed";
          pxDef.palette = await readPalette(stream, 1 << bpp, {});
        } else if (bpp === 24) {
          pxDef.colorModel = "RGB";
        } else {
          throw new ErrorRI(
            "Unsupported OS/2 bitmap color format (<bpp> bit/pixel)",
            { bpp: hd.bcBitCount }
          );
        }
        pxDef.depth = bpp as PixelDepth;
        vars.format = bmpOs2;
        vars.compression = "None";
      } else {
        vars.format = driverBmp.name;
        const bi = readBmpInfoHeaderFromBuffer(ihd);
        compression = bi.biCompression;
        size.set(bi.biWidth, Math.abs(bi.biHeight));
        upDown = bi.biHeight < 0;
        if (bi.biPlanes !== 1) {
          throw new ErrorRI("Unsupported planes count <N> in Windows bitmap", {
            N: bi.biPlanes,
          });
        }
        const bpp = bi.biBitCount;
        pxDef.depth = bpp as PixelDepth;
        if (bpp === 1 || bpp === 4 || bpp === 8) {
          const colorsCount = bi.biClrUsed || 1 << bpp;
          pxDef.palette = await readPalette(stream, colorsCount, {
            dword: "opaque",
          });
          pxDef.colorModel = "Indexed";
        } else if (bpp === 24) {
          pxDef.colorModel = "RGB";
        } else if (bpp === 16 || bpp === 32) {
          pxDef.colorModel = "RGB";
          if (hdType === "v3") {
            signature = "X8B8G8R8";
          } else if (compression === BmpCompression.RGB) {
            if (bi.biBitCount === 16) pxDef.depth = 15;
          } else if (compression === BmpCompression.BITFIELDS) {
            const maskBuf = await stream.read(3 * 4);
            const dv = new DataView(maskBuf.buffer, maskBuf.byteOffset);
            const mask0 = dv.getUint32(0, true);
            const mask1 = dv.getUint32(4, true);
            const mask2 = dv.getUint32(8, true);
            if (bi.biBitCount === 16) {
              // Определение типа упаковки битовых полей
              if (mask0 === 0xf800 && mask1 === 0x07e0 && mask2 === 0x001f)
                pxDef.depth = 16;
              else if (mask0 === 0x7c00 && mask1 === 0x03e0 && mask2 === 0x001f)
                pxDef.depth = 15;
              else pxDef.depth = 24; // Произвольная упаковка (Windows NT)
            }
          }
        } else {
          throw new ErrorRI(
            "Unsupported color format for Windows bitmap: <N> bit/pixel",
            { N: pxDef.depth }
          );
        }
        let compressId = "None";
        switch (compression) {
          case BmpCompression.RGB:
          case BmpCompression.BITFIELDS:
            break;
          case BmpCompression.RLE8:
            if (bpp !== 8)
              throw new ErrorRI(
                "RLE8 valid only for 8 bit/pixel images. Real: <bpp>",
                { bpp }
              );
            compressId = "RLE8";
            break;
          case BmpCompression.RLE4:
            if (bpp !== 4)
              throw new ErrorRI(
                "RLE4 valid only for 16 colors images. Real: <bpp>",
                { bpp }
              );
            compressId = "RLE4";
            break;
          default:
            throw new ErrorRI("Invalid BMP compression method <M>", {
              M: getBmpCompressionName(bi.biCompression),
            });
        }
        vars.compression = compressId;
        vars.resUnit = "meter";
        if (bi.biXPelsPerMeter) vars.resX = bi.biXPelsPerMeter;
        if (bi.biYPelsPerMeter) vars.resY = bi.biYPelsPerMeter;
        if (bi.biClrImportant) vars.importantColors = bi.biClrImportant;
        if (upDown) vars.rowOrder = "forward";
      }
      const imgInfo: ImageInfo = {
        size,
        fmt: signature ? new PixelFormat(signature) : new PixelFormat(pxDef),
        vars,
      };
      return new FrameBmp(
        format,
        imgInfo,
        fhd.bfOffBits,
        frameSize,
        upDown,
        compression
      );
    });
  }

  async read(converter: Converter): Promise<void> {
    const { stream } = this.format;
    return streamLock(stream, async () => {
      const { info, isUpDown } = this;
      await stream.seek(this.offset);
      const params = { converter, info, isUpDown };
      if (
        this.compression === BmpCompression.RLE8 ||
        this.compression === BmpCompression.RLE4
      ) {
        const srcData = await stream.read(this.size);
        await readRleImage({
          srcData,
          ...params,
        });
      } else {
        await readUncompressedImage({
          stream,
          ...params,
        });
      }
    });
  }
}
