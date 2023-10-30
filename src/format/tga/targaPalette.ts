import { Palette } from "../../Palette";
import { RAStream } from "../../stream";
import { ErrorRI } from "../../utils";
import { FnRowOp } from "../../Converter/rowOps/FnRowOp";
import { rgb15to32Quality } from "../../Converter/rowOps/rgb/rgb15";
import { rgb24toRgba32 } from "../../Converter/rowOps/rgb/rgb24toRgba32";
import { TargaHeader } from "./TargaHeader";
import { calcPitch } from "../../ImageInfo/calcPitch";
import { PixelDepth } from "../../types";

const decoders: Record<number, FnRowOp | null> = {
  // Варианты с 15 и 16-битовой палитрой не описаны в документации.
  15: rgb15to32Quality,
  16: rgb15to32Quality,
  24: rgb24toRgba32,
  32: null,
};

export const readTargaPalette = async (
  stream: RAStream,
  header: TargaHeader
): Promise<Palette | undefined> => {
  const { colorMapStart, colorMapLength, colorItemSize } = header;
  if (colorMapLength === 0) {
    return undefined;
  }
  const totalLength = colorMapStart + colorMapLength;
  if (totalLength > 256) {
    throw new ErrorRI("Too large palette length <L>", { L: totalLength });
  }
  const cvt = decoders[colorItemSize];
  if (cvt === undefined) {
    throw new ErrorRI("Unsupported color item size <n>", { n: colorItemSize });
  }

  const rawSize: number = calcPitch(
    colorMapLength,
    colorItemSize as PixelDepth
  );
  const srcBuf = await stream.read(rawSize);
  const palette: Palette = [];
  let qbuf: Uint8Array;
  if (cvt === null) {
    qbuf = srcBuf;
  } else {
    qbuf = new Uint8Array(4 * colorMapLength);
    cvt(colorMapLength, srcBuf, qbuf);
  }
  let pos = 0;
  for (let i = 0; i < colorMapLength; i++) {
    const b = qbuf[pos++]!;
    const g = qbuf[pos++]!;
    const r = qbuf[pos++]!;
    const a = qbuf[pos++]!;
    palette[i + colorMapStart] = [b, g, r, a];
  }
  return palette;
};
