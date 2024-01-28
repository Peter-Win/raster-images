import { RAStream, readWordLE } from "../../../stream";
import { Ifd } from "../ifd/Ifd";
import { TiffCompression } from "../tags/TiffCompression";
import { TiffTag } from "../TiffTag";

export const isOldStyleLzw = async (
  ifd: Ifd,
  stream: RAStream
): Promise<boolean> => {
  const compressionId = await ifd.getSingleNumberOpt(
    TiffTag.Compression,
    stream
  );
  if (compressionId === TiffCompression.LZW) {
    let dataOffs = await ifd.getNumbersOpt(TiffTag.StripOffsets, stream);
    if (!dataOffs) {
      dataOffs = await ifd.getNumbersOpt(TiffTag.TileOffsets, stream);
    }
    if (dataOffs && dataOffs.length > 0) {
      const pos0 = dataOffs[0]!;
      await stream.seek(pos0);
      const w = await readWordLE(stream);
      if ((w & 0x1ff) === 0x100) return true;
    }
  }
  return false;
};
