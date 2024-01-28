import { Point } from "../../math";
import { ImageInfo } from "../../ImageInfo";
import { RAStream } from "../../stream";
import { TiffTag, tiffTagName } from "./TiffTag";
import { Ifd } from "./ifd/Ifd";
import { getIfdNumbers, getIfdString } from "./ifd/IfdEntry";
import { PixelFormat } from "../../PixelFormat";
import {
  PhotometricInterpretation,
  photoIntNames,
} from "./tags/PhotometricInterpretation";
import { Palette } from "../../Palette";
import { ErrorRI } from "../../utils";
import { Variables } from "../../ImageInfo/Variables";
import { TiffExtraSamples } from "./tags/TiffExtraSamples";
import { TiffCompression, tiffCompressionDict } from "./tags/TiffCompression";
import { getTiffResolution } from "./tags/TiffResolution";
import { getTiffTimeStr } from "./tags/TiffTime";
import { loadTiffPalette } from "./TiffPalette";
import { TiffSampleFormat } from "./tags/TiffSampleFormat";
import { isOldStyleLzw } from "./compression/isOldStyleLzw";

/**
 * Important! File pointer is undefined after this function
 * @param ifd
 * @param stream
 */
export const imageInfoFromIfd = async (
  ifd: Ifd,
  stream: RAStream
): Promise<ImageInfo> => {
  const { littleEndian } = ifd;
  const width = await ifd.getSingleNumber(TiffTag.ImageWidth, stream);
  const height = await ifd.getSingleNumber(TiffTag.ImageLength, stream);
  const srcBps = await ifd.getNumbers(TiffTag.BitsPerSample, stream);
  const nSamples = await ifd.getSingleNumber<number>(
    TiffTag.SamplesPerPixel,
    stream,
    1
  );
  let pi = await ifd.getSingleNumberOpt<PhotometricInterpretation>(
    TiffTag.PhotometricInterpretation,
    stream
  );
  if (pi === undefined) {
    if (srcBps.length === 1 && (srcBps[0] === 8 || srcBps[0] === 4)) {
      pi = PhotometricInterpretation.BlackIsZero;
    }
  }
  const sampleFormats = await ifd.getNumbersOpt(TiffTag.SampleFormat, stream);
  let bitsPerSample: number[];
  const colorName = (): string =>
    pi === undefined ? "Undefined" : photoIntNames[pi] ?? String(pi);
  if (srcBps.length === nSamples) {
    bitsPerSample = srcBps;
  } else if (srcBps.length === 1) {
    // пока такая ситуация не встречалась. Но будем считать, что это значение будет одинаково для всех компонент
    bitsPerSample = new Array(nSamples);
    bitsPerSample.fill(srcBps[0]!);
  } else {
    throw new ErrorRI(
      "Invalid bits per sample <bps> for <c> with <n> samples",
      {
        bps: JSON.stringify(srcBps),
        c: colorName(),
        n: nSamples,
      }
    );
  }

  let palette: Palette | undefined;
  let signature = "";
  const onInvalidSamples = () => {
    throw new ErrorRI("Invalid samples count=<n> for <c> color", {
      n: nSamples,
      c: colorName(),
    });
  };
  const vars: Variables = {
    endianness: littleEndian ? "little endian" : "big endian",
  };
  if (ifd.entries[TiffTag.TileWidth]) {
    vars.tileWidth = await ifd.getSingleNumber(TiffTag.TileWidth, stream);
  }
  if (ifd.entries[TiffTag.TileLength]) {
    vars.tileHeight = await ifd.getSingleNumber(TiffTag.TileLength, stream);
  }
  const makeSignature = (
    sampNames: "CMYKA" | "RGBA" | "GA" | "I",
    fixedBits?: number
  ) =>
    bitsPerSample.reduce(
      (s, n, i) => `${s}${sampNames[i]}${fixedBits ?? n}`,
      ""
    );

  const makeSignatureExt = (sampNames: "CMYKA" | "RGBA" | "GA") => {
    const bitsSet = new Set(bitsPerSample);
    const maxBitsPerSample = bitsPerSample.reduce(
      (acc, n) => Math.max(acc, n),
      0
    );
    // Здесь довольно сожная логика, несколько похожая на костыль. Может устареть при изменении в блоке формата пикселей.
    // Возможно, стоит перенести в функции формата пикселей.
    let stdBits = [8, 16, 32, 64];
    if (sampNames[0] === "G" && bitsPerSample.length === 1)
      stdBits = [1, 2, 4, ...stdBits];
    if (bitsSet.size === 1) {
      if (
        (maxBitsPerSample === 16 || maxBitsPerSample === 24) &&
        sampleFormats?.find((n) => n === TiffSampleFormat.floatingPoint)
      ) {
        // 16- and 24-bit floating point => 32-bit
        vars.floatBitsPerSample = maxBitsPerSample;
        return makeSignature(sampNames, 32);
      }

      if (stdBits.includes(maxBitsPerSample)) {
        return makeSignature(sampNames);
      }
    }
    vars.bitsPerSample = bitsPerSample;
    // Пока предполагаем что любые комбинации преобразуются в 16 бит/компонент
    // return bitsPerSample.reduce((acc, _n, i) => `${acc}${sampNames[i]}16`, "");
    return makeSignature(sampNames, 16);
  };

  switch (pi) {
    case PhotometricInterpretation.WhiteIsZero:
    case PhotometricInterpretation.BlackIsZero:
    case PhotometricInterpretation.TransparencyMask:
      signature = makeSignatureExt("GA");
      if (pi === PhotometricInterpretation.WhiteIsZero) vars.inverse = 1;
      break;
    case PhotometricInterpretation.RGB:
      if (nSamples < 3 || nSamples > 4) onInvalidSamples();
      signature = makeSignatureExt("RGBA");
      break;
    case PhotometricInterpretation.PaletteColor:
      if (nSamples !== 1) onInvalidSamples();
      signature = makeSignature("I");
      palette = await loadTiffPalette(ifd, stream);
      break;
    case PhotometricInterpretation.CMYK:
      if (nSamples < 4 || nSamples > 5) onInvalidSamples();
      signature = makeSignatureExt("CMYKA");
      break;
    case PhotometricInterpretation.YCbCr:
      signature = "G8"; // TODO: Пока нет поддержки YCbCr
      break;
    default:
      throw new ErrorRI("Unsupported Photometric Interpretation = <n>", {
        n: colorName(),
      });
  }
  if (signature.includes("A")) {
    const eExtra = ifd.entries[TiffTag.ExtraSamples];
    if (eExtra) {
      const extra = await getIfdNumbers(eExtra, stream, littleEndian);
      if (extra[0] === TiffExtraSamples.Unspecified) {
        signature = signature.replace("A", "X");
      } else if (extra[0] === TiffExtraSamples.Associated) {
        vars.preMultiplied = 1;
      }
    }
  }

  const compressionId = await ifd.getSingleNumber<TiffCompression>(
    TiffTag.Compression,
    stream,
    TiffCompression.None
  );
  vars.compression =
    tiffCompressionDict[compressionId]?.name ?? String(compressionId);
  if (compressionId === TiffCompression.LZW) {
    const isOld = await isOldStyleLzw(ifd, stream);
    if (isOld) vars.compression = "LZW (old-style)";
  }
  const predictor = await ifd.getSingleNumberOpt(TiffTag.Predictor, stream);
  if (predictor !== undefined) {
    vars.predictor = predictor;
  }

  const planarConfiguration = await ifd.getSingleNumber<number>(
    TiffTag.PlanarConfiguration,
    stream,
    0
  );
  if (planarConfiguration >= 1 && planarConfiguration <= 2) {
    vars.planarConfiguration = ["Chunky", "Planar"][planarConfiguration - 1]!;
  }

  const resVars = await getTiffResolution(ifd, stream);
  if (resVars) {
    Object.assign(vars, resVars);
  }

  const creationTime = await getTiffTimeStr(TiffTag.DateTime, ifd, stream);
  if (creationTime) {
    vars.creationTime = creationTime;
  }

  // ASCII tags
  for (const tag of strTags) {
    const entry = ifd.entries[tag];
    if (entry) {
      const name = tiffTagName[entry.tagId as TiffTag];
      if (name) {
        vars[name] = await getIfdString(entry, stream, littleEndian);
      }
    }
  }

  const fmt = new PixelFormat(signature);
  fmt.setPalette(palette);
  return {
    size: new Point(width, height),
    fmt,
    vars,
  };
};

const strTags = [
  TiffTag.Artist,
  TiffTag.Copyright,
  TiffTag.HostComputer,
  TiffTag.ImageDescription,
  TiffTag.Make,
  TiffTag.Model,
  TiffTag.Software,
  TiffTag.DocumentName,
  TiffTag.PageName,
] as const;
