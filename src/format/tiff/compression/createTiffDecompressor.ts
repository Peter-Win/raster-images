import pako from "pako";
import { ErrorRI } from "../../../utils";
import { TiffCompression, tiffCompressionDict } from "../tags/TiffCompression";
import { FnRowHandler, FnStripHandler } from "../load/stripsReader";
import { TiffUnpackerLzw } from "./TiffUnpackerLzw";
import { PixelDepth } from "../../../types";
import { unpackBits } from "../../../algorithm/PackBits";
import { createGroup3Decoder } from "./ccitt/createGroup3Decoder";
import { Ifd } from "../ifd/Ifd";
import { RAStream } from "../../../stream";
import { createModifiedHuffmanDecoder } from "./ccitt/createModifiedHuffmanDecoder";
import { createGroup4Decoder } from "./ccitt/createGroup4Decoder";
import { isOldStyleLzw } from "./isOldStyleLzw";
import { TiffUnpackerLzwOld } from "./TiffUnpackerLzwOld";

type ResTiffDecompressor = {
  stripEncoder?: FnStripHandler;
  rowEncoder?: FnRowHandler;
};

type ParamsCreateTiffDecompressor = {
  compressionId: TiffCompression;
  // width: number;
  rowsPerStrip: number;
  rowSize: number;
  depth: PixelDepth;
  ifd: Ifd;
  stream: RAStream;
};

// Уже понятно, что большинство методов декомпрессии поддерживает построчную распаковку, но сейчас ее использовать не получается
// Предпочтительно использовать rowEncoder
export const createTiffDecompressor = async (
  params: ParamsCreateTiffDecompressor
): Promise<ResTiffDecompressor> => {
  const { compressionId, rowSize, rowsPerStrip, depth, ifd, stream } = params;
  const lzwOld = await isOldStyleLzw(ifd, stream);
  const createStripBuffer = (): Uint8Array =>
    new Uint8Array(rowSize * rowsPerStrip);
  const lzw =
    (): FnStripHandler =>
    (src: Uint8Array): Uint8Array => {
      const unpk = lzwOld
        ? new TiffUnpackerLzwOld(depth, src)
        : new TiffUnpackerLzw(depth, src);
      const dst = createStripBuffer();
      unpk.unpackAll(dst);
      return dst;
    };
  switch (compressionId) {
    case TiffCompression.None:
      return {};
    case TiffCompression.CcittHuffman:
      return createModifiedHuffmanDecoder(rowSize, ifd, stream);
    case TiffCompression.Group3Fax:
      return createGroup3Decoder(rowSize, ifd, stream);
    case TiffCompression.Group4Fax:
      return createGroup4Decoder(rowSize, ifd, stream);
    case TiffCompression.LZW:
      return {
        stripEncoder: lzw(),
      };
    case TiffCompression.PackBits:
      return {
        stripEncoder: (src: Uint8Array) => {
          const dst = createStripBuffer();
          unpackBits(dst, src, src.length);
          return dst;
        },
      };
    case TiffCompression.ZIP:
      return {
        stripEncoder: (src: Uint8Array) => {
          const inflator = new pako.Inflate();
          inflator.push(new Uint8Array(src.buffer, src.byteOffset));
          const { result } = inflator;
          return result as Uint8Array;
        },
      };
    default:
      throw new ErrorRI("<t> compression type is not supported", {
        t: tiffCompressionDict[compressionId]?.name || compressionId,
      });
  }
};
