import { RowsReader, writeImage } from "../../../Converter";
import { OnProgressInfo } from "../../../Converter/ProgressInfo";
import { RAStream, streamLock } from "../../../stream";
import { ErrorRI, utf8ToBytes } from "../../../utils";
import { PnmMapFormat, pnmDescriptions } from "../pnmCommon";
import { PixelFormat } from "../../../PixelFormat";
import { RowWriter, getRowWriter } from "./getRowWriter";
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

const getMaxValue = (sampleDepth: number): number => {
  switch (sampleDepth) {
    case 32:
      return -1;
    case 16:
      return 0xffff;
    default:
      return 0xff;
  }
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
  const sampleDepth = pixFmt.maxSampleDepth;
  const { dataType = "raw", comment, maxRowLength = 70 } = pnmOptions ?? {};
  const mapFormat = detectMapFormat(pixFmt);
  const needFloat = sampleDepth === 32;
  const desc = pnmDescriptions.find(
    ({ type, fmt, isFloat = false }) =>
      fmt === mapFormat && (needFloat ? isFloat : type === dataType)
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
  const maxValue = getMaxValue(sampleDepth);
  if (mapFormat === "pixmap" || mapFormat === "graymap") {
    rows.push(maxValue.toString());
  }
  const header = utf8ToBytes(`${rows.join("\n")}\n`);

  const makeRowForWrite: RowWriter = getRowWriter({
    dataType,
    mapFormat,
    sampleDepth,
    width,
    maxRowLength,
    maxValue,
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
