import { RowsReader, writeImage } from "../../../Converter";
import { OnProgressInfo } from "../../../Converter/ProgressInfo";
import { RAStream, streamLock } from "../../../stream";
import { ErrorRI, utf8ToBytes } from "../../../utils";
import { PnmMapFormat, pnmDescriptions } from "../pnmCommon";
import { PixelFormat } from "../../../PixelFormat";
import { RowWriter, getRowWriter } from "../getRowWriter";
import { OptionsSavePnm } from "./OptionsSavePnm";

/**
 * При сохранении нет смысла указывать формат в терминах PNM (т.е. bitmap | graymap | pixmap)
 * т.к. его описывает пиксельный формат.
 * @param fmt
 * @returns
 */
const detectMapFormat = (fmt: PixelFormat): PnmMapFormat => {
  if (fmt.colorModel === "Gray") {
    return fmt.depth === 1 ? "bitmap" : "graymap";
  }
  return "pixmap";
};

export const savePnm = async (
  reader: RowsReader,
  stream: RAStream,
  pnmOptions?: OptionsSavePnm,
  progress?: OnProgressInfo
) => {
  const { dstInfo } = reader;
  const { size, fmt: pixFmt } = dstInfo;
  const { x: width, y: height } = size;
  const is16bit = pixFmt.samples[0]?.length === 16;
  const { dataType = "raw", comment, maxRowLength = 70 } = pnmOptions ?? {};
  const mapFormat = detectMapFormat(pixFmt);
  const desc = pnmDescriptions.find(
    ({ type, fmt }) => fmt === mapFormat && type === dataType
  );
  if (!desc) {
    // Теоретически такого возникнуть не должно, т.к. pnmDescriptions содержит все сочетания. Но на практике всякое бывает.
    throw new ErrorRI("Invalid PNM format");
  }
  const rows: string[] = [desc.sign];
  if (comment) {
    rows.push(`# ${comment}`);
  }
  rows.push(`${width} ${height}`);
  if (mapFormat === "pixmap" || mapFormat === "graymap") {
    rows.push((is16bit ? 0xffff : 0xff).toString());
  }
  const header = utf8ToBytes(`${rows.join("\n")}\n`);

  const makeRowForWrite: RowWriter = getRowWriter({
    dataType,
    mapFormat,
    is16bit,
    width,
    maxRowLength,
  });

  await streamLock(stream, async () => {
    await stream.seek(0);
    await stream.write(header);

    await writeImage(
      reader,
      async (srcRow) => {
        const dstRow = makeRowForWrite(srcRow);
        await stream.write(dstRow);
      },
      { progress }
    );
  });
};
