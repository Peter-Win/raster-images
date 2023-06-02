import { ImageWriter } from "../../transfer/ImageWriter";
import { ResolutionUnit, resolutionToMeters } from "../../ImageInfo/resolution";
import { PixelFormat } from "../../PixelFormat";
import { calcPitch } from "../../ImageInfo/calcPitch";
import { writeImage } from "../../transfer/writeImage";
import { Surface } from "../../Surface";
import { getVarNumber } from "../../ImageInfo/Variables";
import { calcPaletteSize } from "../../Palette/calcPaletteSize";
import { writePalette, writePaletteToBuf } from "../../Palette/writePalette";
import { ErrorRI } from "../../utils";
import { RAStream, streamLock } from "../../stream";
import { FormatForSave } from "../FormatForSave";
import { bmpOs2 } from "./bmpCommon";
import {
  BmpFileHeader,
  bmpFileHeaderSize,
  writeBmpFileHeader,
} from "./BmpFileHeader";
import {
  BmpCoreHeader,
  sizeBmpCoreHeader,
  writeBmpCoreHeader,
} from "./BmpCoreHeader";
import {
  BmpCompression,
  BmpInfoHeader,
  bmpInfoHeaderSize,
  writeBmpInfoHeader,
} from "./BmpInfoHeader";

export const saveBmp = async (format: FormatForSave, stream: RAStream) => {
  const { frames } = format;
  if (frames.length !== 1) {
    throw new ErrorRI("Can't write BMP file with <n> frames", {
      n: frames.length,
    });
  }
  const frame = frames[0]!;
  const { info } = frame;
  const { size, vars, fmt: pixFmt } = info;
  const { colorModel, depth, palette } = pixFmt;

  if (colorModel !== "RGB" && colorModel !== "Indexed") {
    throw new ErrorRI("Wrong BMP image color model: <colm>", {
      colm: colorModel,
    });
  }
  const onEmptyPal = () => new ErrorRI("Indexed image without a palette");

  const os2 = vars?.format === bmpOs2;

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
      const bcBuf = new Uint8Array(sizeBmpCoreHeader);
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
      upDown = vars?.rowOrder === "UpToDown";
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
        biClrImportant: getVarNumber(vars?.importantColors, 0),
        biSizeImage: 0,
        biXPelsPerMeter: 0,
        biYPelsPerMeter: 0,
      };
      const resX = getVarNumber(vars?.resX, 0);
      const resY = getVarNumber(vars?.resY, 0);
      if (resX && resY) {
        const resUnit = (vars?.resUnit ?? "meter") as ResolutionUnit;
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
    const surface: Surface = await frame.getImage();
    await writeImage(surface, pixFmt, async (writer: ImageWriter) => {
      const [yBegin, yEnd, yStep] = upDown
        ? [0, size.y, 1]
        : [size.y - 1, -1, -1];
      for (let y = yBegin; y !== yEnd; y += yStep) {
        const pixels = await writer.getRowBuffer(y);
        await stream.write(pixels, lineSize);
        if (deltaBuf) await stream.write(deltaBuf);
      }
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
