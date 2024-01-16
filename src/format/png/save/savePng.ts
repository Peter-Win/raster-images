import pako from "pako";
import { copyBytes } from "../../../Converter/rowOps/copy/copyBytes";
import { makePaletteBuf } from "../../../Palette/writePalette";
import { RowsReader, OnProgressInfo, writeImage } from "../../../Converter";
import { RAStream, streamLock } from "../../../stream";
import { pngSignature } from "../checkPngSignature";
import {
  makePngColorType,
  makePngHeaderBuffer,
  PngHeader,
} from "../chunks/PngHeader";
import { OptionsSavePng, PngPackLevelStd } from "./OptionsSavePng";
import { writePngChunk } from "./writePngChunk";
import { analyzePaletteTransparency } from "../../../Palette";
import { transparencyFromPalette } from "../chunks/PngTransparency";
import { dateToPngTime, writePngTimeToBuffer } from "../chunks/PngTime";
import { encodeWords } from "../../../Converter/rowOps/numbers/encodeWords";

export const savePng = async (
  reader: RowsReader,
  stream: RAStream,
  options?: OptionsSavePng,
  progress?: OnProgressInfo
) => {
  await streamLock(stream, async () => {
    const signBuf = new Uint8Array(pngSignature);
    const { dstInfo } = reader;
    const { fmt, size } = dstInfo;
    const { modificationTime, level = PngPackLevelStd.default } = options ?? {};
    const is16bitSamples = fmt.maxSampleDepth === 16;

    await stream.write(signBuf);
    const hdr: PngHeader = {
      width: size.x,
      height: size.y,
      bitDepth: fmt.maxSampleDepth,
      colorType: makePngColorType(fmt),
      compression: 0,
      filter: 0,
      interlaced: 0, // TODO: пока не поддерживается прогрессивность
    };
    await writePngChunk(stream, "IHDR", makePngHeaderBuffer(hdr));

    if (modificationTime) {
      const t = dateToPngTime(modificationTime);
      const tbuf = writePngTimeToBuffer(t);
      await writePngChunk(stream, "tIME", tbuf);
    }

    // zTXt, tEXt, iTXt, pHYs, sPLT
    // iCCP, sRGB, sBIT, gAMA, cHRM
    // PLTE
    const { palette } = fmt;
    if (palette) {
      const palBuf = makePaletteBuf(palette, { rgb: true });
      await writePngChunk(stream, "PLTE", palBuf);

      const trn = analyzePaletteTransparency(palette);
      if (trn.type !== "opaque") {
        await writePngChunk(stream, "tRNS", transparencyFromPalette(palette));
      }
    }
    // hIST, bKGD
    // IDAT
    // Пока что всё в один чанк
    const deflator = new pako.Deflate({ level });
    const writeRow = async (srcRow: Uint8Array, y: number) => {
      // Пока используется максимально надежный (но возможно не очень быстрый вариант)
      // Сечас для всех строк выделяется отдельный буфер
      const { length } = srcRow;
      const dst = new Uint8Array(length + 1);
      // Пока что без фильтрации
      if (is16bitSamples) {
        // Для 16-битовых данных нужно соблюдать числовой формат
        encodeWords(false, length >> 1, srcRow, 0, dst, 1);
      } else {
        copyBytes(length, srcRow, 0, dst, 1);
      }
      deflator.push(dst, y + 1 === size.y);
    };
    await writeImage(reader, writeRow, { progress });
    await writePngChunk(stream, "IDAT", deflator.result);

    await writePngChunk(stream, "IEND");
  });
};
