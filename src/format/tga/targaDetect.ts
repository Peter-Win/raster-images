import { RAStream } from "../../stream";
import {
  TargaImageType,
  readTargaHeader,
  targaHeaderSize,
} from "./TargaHeader";

// К сожалению, у формата Targa нет явного признака.
// Поэтому проверяем правдоподобность данных в заголовке.

const validTypes: Record<TargaImageType, boolean> = {
  [TargaImageType.noImageData]: true,
  [TargaImageType.uncompressedColorMapped]: true,
  [TargaImageType.uncompressedTrueColor]: true,
  [TargaImageType.uncompressedGray]: true,
  [TargaImageType.rleColorMapped]: true,
  [TargaImageType.rleTrueColor]: true,
};

const validDepth = new Set([8, 15, 16, 24, 32]);

export const targaDetect = async (stream: RAStream): Promise<boolean> => {
  try {
    await stream.seek(0);
    const size = await stream.getSize();
    if (size <= targaHeaderSize) {
      return false;
    }
    const hdr = await readTargaHeader(stream);
    if (!validTypes[hdr.imageType]) {
      return false;
    }
    if (hdr.colorMapStart + hdr.colorItemSize > 256) {
      return false;
    }
    if (hdr.colorItemSize !== 0 && !validDepth.has(hdr.colorItemSize)) {
      return false;
    }
    if (!validDepth.has(hdr.depth)) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};
