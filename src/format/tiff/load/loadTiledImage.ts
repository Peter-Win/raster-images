import { SurfaceStd } from "../../../Surface";
import { Converter, readImage } from "../../../Converter";
import { ImageInfo } from "../../../ImageInfo";
import { RAStream } from "../../../stream";
import { TiffTag, tiffTagName } from "../TiffTag";
import { Ifd } from "../ifd/Ifd";
import { copyBytes } from "../../../Converter/rowOps/copy/copyBytes";
import { ErrorRI } from "../../../utils";
import { createPixelFiller } from "../../../draw/PixelFiller/createPixelFiller";
import { PixelFillerCtx } from "../../../draw/PixelFiller/PixelFiller";
import { calcPitch } from "../../../ImageInfo/calcPitch";
import { createStripsReader } from "./createStripsReader";
import { PixelDepth } from "../../../types";
import { joinPlanes } from "../../../Converter/rowOps/planes/joinPlanes";
import { getFloatBitPerSample } from "./floatBitPerSample";
import {
  getNativeBitsPerSamples,
  getPlanarNativeBitsPerSamples,
} from "../compression/expandBitSamples";

interface Params {
  ifd: Ifd;
  stream: RAStream;
  info: ImageInfo;
  converter: Converter;
  planarConfiguration: number;
}

export const loadTiledImage = async (params: Params) => {
  const { ifd, stream, info, converter, planarConfiguration } = params;
  const { x: imageWidth, y: imageHeight } = info.size;
  const dstSamplesCount = info.fmt.samples.length;
  const tileWidth = await ifd.getSingleNumber(TiffTag.TileWidth, stream);
  const tileLength = await ifd.getSingleNumber(TiffTag.TileLength, stream);

  const tilesAcross = Math.floor((imageWidth + tileWidth - 1) / tileWidth);
  const tilesDown = Math.floor((imageHeight + tileLength - 1) / tileLength);
  const tilesPerImage = tilesAcross * tilesDown;
  const floatBitsPerSample = getFloatBitPerSample(info.vars);
  const nativeBitsPerSamples = getNativeBitsPerSamples(info.vars);

  const safeGetNumbers = async (attr: TiffTag): Promise<number[]> => {
    const values = await ifd.getNumbers(attr, stream);
    const needTilesCount =
      planarConfiguration === 2
        ? tilesPerImage * dstSamplesCount
        : tilesPerImage;
    if (values.length !== needTilesCount) {
      throw new ErrorRI("Expected <need> <attr>, but found <real>", {
        attr: tiffTagName[attr],
        need: needTilesCount,
        real: values.length,
      });
    }
    return values;
  };

  const tileOffsets = await safeGetNumbers(TiffTag.TileOffsets);
  const tileByteCounts = await safeGetNumbers(TiffTag.TileByteCounts);

  // Можно было бы оптимизировать. Если обрабатывать тайлы в одной строке.
  // Но пока вариант с полным изображением
  const dstImg = new SurfaceStd(info);

  const bitsPerSample = info.fmt.maxSampleDepth as PixelDepth;
  const samplesCount = info.fmt.samples.length;
  const pix = createPixelFiller(info.fmt);
  let curTileIndex = 0;
  for (let yt = 0; yt < tilesDown; yt++) {
    const yA = yt * tileLength;
    const yB = Math.min(imageHeight, (yt + 1) * tileLength);
    const curHeight = yB - yA;
    for (let xt = 0; xt < tilesAcross; xt++) {
      const xA = xt * tileWidth;
      const xB = Math.min(imageWidth, (xt + 1) * tileWidth);
      const curWidth = xB - xA;
      const rowSize = calcPitch(curWidth, info.fmt.depth);

      const tmp = new Uint8Array(rowSize);

      if (planarConfiguration === 2) {
        // planar
        const sampleRowSize = calcPitch(curWidth, bitsPerSample);
        const bytesPerSample = bitsPerSample >> 3;
        const onPlane: ((row: Uint8Array, y: number) => Promise<void>)[] = [];
        const sampRow: Uint8Array[] = [];
        for (let iSample = 0; iSample < dstSamplesCount; iSample++) {
          const sampleTileIndex = curTileIndex + iSample * tilesPerImage;
          sampRow[iSample] = new Uint8Array(sampleRowSize);
          onPlane[iSample] = await createStripsReader({
            offsets: [tileOffsets[sampleTileIndex]!],
            sizes: [tileByteCounts[sampleTileIndex]!],
            ifd,
            stream,
            rowSize: sampleRowSize,
            bitsPerSample,
            samplesCount: 1,
            nativeBitsPerSamples: getPlanarNativeBitsPerSamples(
              nativeBitsPerSamples,
              iSample
            ),
            floatBitsPerSample,
          });
        }
        curTileIndex++;
        for (let y = 0; y < curHeight; y++) {
          for (let iSample = 0; iSample < dstSamplesCount; iSample++) {
            await onPlane[iSample]!(sampRow[iSample]!, y);
          }
          joinPlanes(curWidth, bytesPerSample, sampRow, tmp);
          const ctx: PixelFillerCtx = {
            src: tmp,
            dst: dstImg.getRowBuffer(yA + y),
          };
          for (let x = 0; x < curWidth; x++) {
            pix(ctx, x, x + xA);
          }
        }
      } else {
        // chunky
        const onTileRow = await createStripsReader({
          offsets: [tileOffsets[curTileIndex]!],
          sizes: [tileByteCounts[curTileIndex]!],
          ifd,
          stream,
          rowSize,
          bitsPerSample,
          samplesCount,
          nativeBitsPerSamples,
          floatBitsPerSample,
        });
        for (let y = 0; y < curHeight; y++) {
          const ctx: PixelFillerCtx = {
            src: tmp,
            dst: dstImg.getRowBuffer(yA + y),
          };
          await onTileRow(tmp, y);
          for (let x = 0; x < curWidth; x++) {
            pix(ctx, x, x + xA);
          }
        }
        curTileIndex++;
      }
    }
  }

  const { rowSize } = dstImg;
  const onRow = async (row: Uint8Array, y: number) => {
    copyBytes(rowSize, dstImg.getRowBuffer(y), 0, row, 0);
  };
  await readImage(converter, info, onRow);
};
