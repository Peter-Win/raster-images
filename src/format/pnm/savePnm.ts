import { OnProgressInfo } from "../../Converter/ProgressInfo";
import { RAStream, streamLock } from "../../stream";
import { FormatForSave } from "../FormatForSave";
import { ErrorRI, utf8ToBytes } from "../../utils";
import { PnmDataType, PnmMapFormat, pnmDescriptions } from "./pnmCommon";
import { PixelFormat } from "../../PixelFormat";
import { RowWriter, getRowWriter } from "./getRowWriter";
import {
  Converter,
  createConverterForWrite,
  writeImage,
} from "../../Converter";

export interface PnmSaveOptions {
  dataType?: PnmDataType; // default = raw
  mapFormat?: PnmMapFormat;
  comment?: string;
  maxRowLength?: number; // default = 70
  converter?: Converter;
  progress?: OnProgressInfo; // Only use with empty converter!
}

const detectMapFormat = (fmt: PixelFormat): PnmMapFormat => {
  if (fmt.colorModel === "Gray") {
    return fmt.depth === 1 ? "bitmap" : "graymap";
  }
  return "pixmap";
};

/**
 * @param format
 * @param stream
 */
export const savePnm = async (
  format: FormatForSave,
  stream: RAStream,
  options: PnmSaveOptions
) => {
  const { frames } = format;
  if (frames.length !== 1) {
    throw new ErrorRI("Can't write <fmt> file with <n> frames", {
      fmt: "BMP",
      n: frames.length,
    });
  }
  const frame = frames[0]!;
  const { info } = frame;
  const { size, fmt: pixFmt } = info;
  const { depth } = pixFmt;
  const { x: width, y: height } = size;
  const is16bit = pixFmt.samples[0]?.length === 16;

  const {
    mapFormat = detectMapFormat(pixFmt),
    dataType = "raw",
    comment,
    maxRowLength = 70,
    converter,
    progress,
  } = options;
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

  let dstSign = "R8G8B8";
  if (pixFmt.colorModel !== "Gray") {
    if (is16bit) dstSign = "R16G16B16";
  } else if (depth === 1) {
    dstSign = "G1";
  } else {
    dstSign = is16bit ? "G16" : "G8";
  }
  const dstPixFmt = new PixelFormat(dstSign);
  const srcImage = await frame.getImage();

  const realConverter: Converter =
    converter ?? createConverterForWrite(srcImage, dstPixFmt, { progress });
  const reader = await realConverter.getRowsReader();

  await streamLock(stream, async () => {
    await stream.seek(0);
    await stream.write(header);

    await writeImage(
      reader,
      async (srcRow) => {
        const dstRow = makeRowForWrite(srcRow);
        await stream.write(dstRow);
      },
      {
        progress: realConverter.progress,
      }
    );
  });
};
