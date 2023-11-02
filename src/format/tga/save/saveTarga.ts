import { writePalette } from "../../../Palette";
import { calcPitch } from "../../../ImageInfo/calcPitch";
import { OnProgressInfo, RowsReader, writeImage } from "../../../Converter";
import { stdRowOrder } from "../../../Converter/rowOrder";
import { RAStream, streamLock } from "../../../stream";
import { OptionsTarga } from "../OptionsTarga";
import { makeTargaHeader } from "../makeTargaHeader";
import { targaHeaderToBuffer } from "../TargaHeader";
import { rlePack } from "../rlePack";
import { reverseRow } from "../reverseRow";

export const saveTarga = async (
  reader: RowsReader,
  stream: RAStream,
  options?: OptionsTarga,
  progress?: OnProgressInfo
) => {
  const { dstInfo } = reader;
  const bytesPerPixel = calcPitch(1, dstInfo.fmt.depth);
  const hdr = makeTargaHeader(dstInfo, options || {});
  const { width } = hdr;
  const hdrBuf = targaHeaderToBuffer(hdr);
  const rowOrder = stdRowOrder(options?.top2bottom ? "forward" : "backward");
  let writeRow: (row: Uint8Array) => Promise<void>;
  if (!options?.compression) {
    writeRow = async (row) => {
      await stream.write(row);
    };
  } else {
    const pack = rlePack(dstInfo.size.x, bytesPerPixel);
    writeRow = async (row) => {
      await stream.write(pack(row));
    };
  }
  if (options?.right2left) {
    const writeRowLtr = writeRow;
    writeRow = async (row) => {
      reverseRow(width, row, bytesPerPixel);
      await writeRowLtr(row);
    };
  }
  await streamLock(stream, async () => {
    await stream.write(hdrBuf);
    const { palette } = dstInfo.fmt;
    if (palette) {
      await writePalette(palette, stream, {});
    }
    await writeImage(reader, writeRow, { progress, rowOrder });
  });
};
