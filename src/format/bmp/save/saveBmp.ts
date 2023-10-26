import { OnProgressInfo } from "../../../Converter/ProgressInfo";
import { RowsReader, writeImage } from "../../../Converter";
import { stdRowOrder } from "../../../Converter/rowOrder";
import { calcPitch } from "../../../ImageInfo/calcPitch";
import { resolutionToMeters } from "../../../ImageInfo/resolution";
import { writePaletteToBuf, writePalette } from "../../../Palette";
import { calcPaletteSize } from "../../../Palette/calcPaletteSize";
import { PixelFormat } from "../../../PixelFormat";
import { RAStream, streamLock } from "../../../stream";
import { ErrorRI } from "../../../utils";
import {
  bmpCoreHeaderSize,
  BmpCoreHeader,
  writeBmpCoreHeader,
} from "../BmpCoreHeader";
import {
  bmpFileHeaderSize,
  BmpFileHeader,
  writeBmpFileHeader,
} from "../BmpFileHeader";
import {
  bmpInfoHeaderSize,
  BmpInfoHeader,
  BmpCompression,
  writeBmpInfoHeader,
} from "../BmpInfoHeader";
import { OptionsSaveBmp } from "./OptionsSaveBmp";

/**
 * Low-level final function
 * @param converter
 * @param stream
 * @param options все опции передаются явно через параметры. Переменные из ImageInfo игнорируются.
 */
export const saveBmp = async (
  reader: RowsReader,
  stream: RAStream,
  options?: OptionsSaveBmp,
  progress?: OnProgressInfo
) => {
  const info = reader.dstInfo;
  const { size, fmt: pixFmt } = info;
  const { colorModel, depth, palette } = pixFmt;

  if (colorModel !== "RGB" && colorModel !== "Indexed") {
    throw new ErrorRI("Wrong BMP image color model: <colm>", {
      colm: colorModel,
    });
  }
  const onEmptyPal = () => new ErrorRI("Indexed image without a palette");

  const os2 = options?.os2;

  await streamLock(stream, async () => {
    // reserve space for file header
    await stream.seek(0);
    const hdrBuf = new Uint8Array(bmpFileHeaderSize);
    const hdr: BmpFileHeader = {
      bfSize: 0,
      bfOffBits: 0,
    };
    writeBmpFileHeader(hdr, hdrBuf.buffer, hdrBuf.byteOffset);
    await stream.write(hdrBuf, hdrBuf.byteLength);
    let upDown = false;
    // info header
    if (os2) {
      if (![1, 4, 8, 24].includes(depth)) {
        throw new ErrorRI(
          "Unsupported OS/2 bitmap color depth: <depth> bit/pixel",
          { depth }
        );
      }
      const bcBuf = new Uint8Array(bmpCoreHeaderSize);
      const coreHeader: BmpCoreHeader = {
        bcSize: bcBuf.byteLength,
        bcWidth: size.x,
        bcHeight: size.y,
        bcPlanes: 1,
        bcBitCount: depth,
      };
      writeBmpCoreHeader(coreHeader, bcBuf.buffer, bcBuf.byteOffset);
      await stream.write(bcBuf);
      if (colorModel === "Indexed") {
        if (!palette) throw onEmptyPal();
        const colors = 1 << depth;
        if (palette.length > colors)
          throw new ErrorRI(
            "The number of colors in the palette (<col>) exceeds the limit (<lim>)",
            {
              col: palette.length,
              lim: colors,
            }
          );
        const palParams = {};
        const palBuf = new Uint8Array(calcPaletteSize(colors, palParams));
        writePaletteToBuf(palette, palBuf, palParams);
        await stream.write(palBuf, palBuf.byteLength);
      }
    } else {
      const biBuf = new Uint8Array(bmpInfoHeaderSize);
      const bitCount = pixFmt.depthAligned;
      const colors = palette?.length || 0;
      upDown = options?.rowOrder === "forward";
      const bi: BmpInfoHeader = {
        biSize: biBuf.byteLength,
        biPlanes: 1,
        biWidth: size.x,
        biHeight: upDown ? -size.y : size.y,
        biBitCount: bitCount,
        // For 16-bpp bitmaps, if biCompression equals BI_RGB, the format is always RGB 555.
        // If biCompression equals BI_BITFIELDS, the format is either RGB 555 or RGB 565.
        biCompression:
          depth === 16 || bitCount === 32
            ? BmpCompression.BITFIELDS
            : BmpCompression.RGB,
        biClrUsed: colors,
        biClrImportant: options?.importantColors ?? 0,
        biSizeImage: 0,
        biXPelsPerMeter: 0,
        biYPelsPerMeter: 0,
      };
      const resX = options?.resX ?? 0;
      const resY = options?.resY ?? 0;
      if (resX && resY) {
        const resUnit = options?.resUnit ?? "meter";
        bi.biXPelsPerMeter = Math.round(resolutionToMeters(resX, resUnit));
        bi.biYPelsPerMeter = Math.round(resolutionToMeters(resY, resUnit));
      }
      writeBmpInfoHeader(bi, biBuf.buffer, biBuf.byteOffset);
      await stream.write(biBuf, biBuf.byteLength);
      if (colorModel === "Indexed") {
        if (!palette) throw onEmptyPal();
        await writePalette(palette, stream, { dword: true });
      } else if (bi.biCompression === BmpCompression.BITFIELDS) {
        await stream.write(makeBitFields(pixFmt));
      }
    }
    hdr.bfOffBits = await stream.getPos();
    const lineSize = calcPitch(size.x, depth);
    const bmpLineSize = calcPitch(size.x, depth, 4);
    const delta = bmpLineSize - lineSize;
    const deltaBuf = delta ? new Uint8Array(delta) : undefined;
    const writeRow = async (pixels: Uint8Array) => {
      await stream.write(pixels, lineSize);
      if (deltaBuf) await stream.write(deltaBuf);
    };
    await writeImage(reader, writeRow, {
      progress,
      rowOrder: stdRowOrder(upDown ? "forward" : "backward"),
    });
    hdr.bfSize = await stream.getPos();
    stream.seek(0);
    writeBmpFileHeader(hdr, hdrBuf.buffer, hdrBuf.byteOffset);
    await stream.write(hdrBuf);
  });
};

const makeBitFields = (pixFmt: PixelFormat): Uint8Array => {
  const buf = new Uint8Array(4 * 3);
  const dv = new DataView(buf.buffer);
  const { sampleBitMasks, samples } = pixFmt;
  (["R", "G", "B"] as const).forEach((needSign, dstPos) => {
    const i = samples.findIndex(({ sign }) => sign === needSign);
    if (i < 0) throw new ErrorRI("Not found <sign> sample", { sign: needSign });
    dv.setUint32(dstPos * 4, Number(sampleBitMasks[i]!), true);
  });
  return buf;
};
