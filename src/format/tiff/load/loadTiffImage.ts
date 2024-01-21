import { ImageInfo } from "../../../ImageInfo";
import { Converter } from "../../../Converter";
import { RAStream, streamLock } from "../../../stream";
import { TiffTag } from "../TiffTag";
import { Ifd } from "../ifd/Ifd";
import { loadStripImage } from "./loadStripImage";
import { loadTiledImage } from "./loadTiledImage";

interface Params {
  ifd: Ifd;
  stream: RAStream;
  info: ImageInfo;
  converter: Converter;
}

export const loadTiffImage = (params: Params) =>
  streamLock(params.stream, async () => {
    const { ifd, stream, info, converter } = params;

    const planarConfiguration = await ifd.getSingleNumber<number>(
      TiffTag.PlanarConfiguration,
      stream,
      1
    );

    const eTileWidth = ifd.entries[TiffTag.TileWidth];
    const eTileLength = ifd.entries[TiffTag.TileLength];
    if (eTileWidth && eTileLength) {
      await loadTiledImage({
        ifd,
        stream,
        info,
        converter,
        planarConfiguration,
      });
      return;
    }

    const stripOffsets = await ifd.getNumbers(TiffTag.StripOffsets, stream);
    let stripByteCounts = await ifd.getNumbersOpt(
      TiffTag.StripByteCounts,
      stream
    );
    if (!stripByteCounts) {
      if (stripOffsets.length === 1) {
        // По стандарту этот тег обязательный.
        // Однако есть ряд файлов, где его нет. А стандартные программы их успешно читают.
        // see G3PROB.TIF
        // Не удалось найти внятных рекомендаций, как действовать в таком случае.
        // Можно было бы искать конец данных, путем поиска следующего тега. Но результат не гарантирован.
        // Проще всего считать, что данные идут до конца файла.
        // Всё равно распаковщик дойдет до конца реальных данных и остановится
        const fileSize = await stream.getSize();
        stripByteCounts = [fileSize - stripOffsets[0]!];
      } else {
        throw new Error("Not found StripByteCounts tag");
      }
    }

    await loadStripImage({
      ifd,
      stream,
      info,
      converter,
      stripOffsets,
      stripByteCounts,
      planarConfiguration,
    });
  });
