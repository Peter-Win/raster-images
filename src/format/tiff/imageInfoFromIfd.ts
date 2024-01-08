import { Point } from "../../math";
import { ImageInfo } from "../../ImageInfo";
import { RAStream } from "../../stream";
import { TiffTag, tiffTagName } from "./TiffTag";
import { Ifd } from "./ifd/Ifd";
import {
  getIfdNumbers,
  getIfdSingleNumber,
  getIfdString,
} from "./ifd/IfdEntry";
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
  const eWidth = ifd.getEntry(TiffTag.ImageWidth);
  const width = await getIfdSingleNumber(eWidth, stream, littleEndian);
  const eHeight = ifd.getEntry(TiffTag.ImageLength);
  const height = await getIfdSingleNumber(eHeight, stream, littleEndian);
  const ePI = ifd.getEntry(TiffTag.PhotometricInterpretation);
  const pi = await getIfdSingleNumber(ePI, stream, littleEndian);
  const eBps = ifd.getEntry(TiffTag.BitsPerSample);
  const srcBps = await getIfdNumbers(eBps, stream, littleEndian);
  const eSamples = ifd.entries[TiffTag.SamplesPerPixel];
  const nSamples = eSamples
    ? await getIfdSingleNumber(eSamples, stream, littleEndian)
    : 1;
  let bitsPerSample: number[];
  const colorName = (): string =>
    photoIntNames[pi as PhotometricInterpretation] ?? String(pi);
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
  const makeSignature = (sampNames: "RGBA" | "GA" | "I") =>
    bitsPerSample.reduce((s, n, i) => `${s}${sampNames[i]}${n}`, "");
  const vars: Variables = {
    numberFormat: littleEndian ? "little endian" : "big endian",
  };
  switch (pi) {
    case PhotometricInterpretation.WhiteIsZero:
    case PhotometricInterpretation.BlackIsZero:
    case PhotometricInterpretation.TransparencyMask:
      signature = makeSignature("GA");
      if (pi === PhotometricInterpretation.WhiteIsZero) vars.inverse = 1;
      break;
    case PhotometricInterpretation.RGB:
      if (nSamples < 3 || nSamples > 4) onInvalidSamples();
      signature = makeSignature("RGBA");
      break;
    case PhotometricInterpretation.PaletteColor:
      if (nSamples !== 1) onInvalidSamples();
      signature = makeSignature("I");
      palette = await loadTiffPalette(ifd, stream);
      break;
    default:
      throw new ErrorRI("Unsupported Photometric Interpretation = <n>", {
        n: pi,
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

  const eCompression = ifd.entries[TiffTag.Compression];
  if (eCompression) {
    const c = await getIfdSingleNumber(eCompression, stream, littleEndian);
    vars.compression =
      tiffCompressionDict[c as TiffCompression]?.name ?? String(c);
  }

  const planarConfiguration = await ifd.getSingleNumber<number>(
    TiffTag.PlanarConfiguration,
    stream,
    0
  );
  if (planarConfiguration >= 1 && planarConfiguration <= 2) {
    vars.planarConfiguration = ["Chunky", "Planar"][planarConfiguration - 1]!;
  }

  const resVars = await getTiffResolution(ifd, stream, littleEndian);
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
