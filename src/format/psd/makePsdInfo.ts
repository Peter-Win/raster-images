import { Point } from "../../math";
import { ImageInfo } from "../../ImageInfo";
import { PsdColorMode, PsdFileHeader, psdColorModeName } from "./PsdFileHeader";
import { PixelFormat } from "../../PixelFormat";
import { ErrorRI } from "../../utils";
import { PixelDepth } from "../../types";
import { ChannelInfo, LayerRecord } from "./psdLayerInfo";
import { Variables } from "../../ImageInfo/Variables";
import { blendModeNames } from "./blendMode";

export const makePsdImageInfo = (header: PsdFileHeader): ImageInfo => {
  const { colorMode, width, height, depth, nChannels } = header;
  const size = new Point(width, height);
  const isStdDepth = depth === 8 || depth === 16 || depth === 32;
  let fmt: PixelFormat | undefined;
  switch (colorMode) {
    case PsdColorMode.Bitmap:
      if (depth === 1 && nChannels === 1) {
        fmt = new PixelFormat("G1");
      }
      break;
    case PsdColorMode.Grayscale:
      if (isStdDepth && nChannels === 1) {
        fmt = new PixelFormat(depth, "Gray", false);
      }
      break;
    case PsdColorMode.CMYK:
      if (isStdDepth && (nChannels === 4 || nChannels === 5)) {
        fmt = new PixelFormat(
          (depth * nChannels) as PixelDepth,
          "CMYK",
          nChannels === 5
        );
      }
      break;
    case PsdColorMode.RGB:
      if (isStdDepth && nChannels === 3) {
        fmt = new PixelFormat(`R${depth}G${depth}B${depth}`);
      } else if (isStdDepth && nChannels === 4) {
        fmt = new PixelFormat(`R${depth}G${depth}B${depth}A${depth}`);
      }
      break;
    case PsdColorMode.Indexed:
      if (depth === 8 && nChannels === 1) {
        fmt = new PixelFormat("I8");
      }
      break;
    default:
      break;
  }
  if (!fmt) {
    throw new ErrorRI(
      "Unsupported PSD color mode: <mode>, <depth> bit/pixel, <n> channels",
      {
        mode: psdColorModeName[colorMode] ?? String(colorMode),
        depth,
        n: nChannels,
      }
    );
  }
  return { size, fmt };
};

const channelsKey = (
  channels: ChannelInfo[],
  keysMap: Record<number, string>
): string => {
  const ids = channels
    .map(({ channelId }) => channelId)
    .filter((id) => id >= -1);
  ids.sort();
  return ids.map((id) => keysMap[id] ?? "?").join("");
};

const key2sign = (key: string, bitsPerSample: number): string => {
  const samples = Array.from(key);
  if (samples[0] === "A") {
    samples.push(samples.shift()!);
  }
  return samples.map((s) => `${s}${bitsPerSample}`).join("");
};

export const makePsdLayerInfo = (
  header: PsdFileHeader,
  layer: LayerRecord
): ImageInfo => {
  const { colorMode, depth } = header;
  const {
    left,
    top,
    right,
    bottom,
    channels,
    layerName,
    blendMode,
    compression,
    vars: extVars,
  } = layer;
  const vars: Variables = {
    orgX: left,
    orgY: top,
    name: layerName,
    compression,
    blendModeKey: blendMode,
  };
  const blendModeName = blendModeNames[blendMode];
  if (blendModeName) vars.blendModeName = blendModeName;

  const size = new Point(right - left, bottom - top);
  const isStdDepth = depth === 8 || depth === 16 || depth === 32;
  let fmt: PixelFormat | undefined;

  switch (colorMode) {
    case PsdColorMode.Grayscale:
      if (isStdDepth) {
        const key = channelsKey(channels, { [-1]: "A", 0: "G" });
        if (key === "G" || key === "AG") {
          fmt = new PixelFormat(key2sign(key, depth));
        }
      }
      break;
    case PsdColorMode.RGB:
      if (isStdDepth) {
        const key = channelsKey(channels, {
          [-1]: "A",
          0: "R",
          1: "G",
          2: "B",
        });
        if (key === "RGB" || key === "ARGB") {
          fmt = new PixelFormat(key2sign(key, depth));
        }
      }
      break;
    case PsdColorMode.CMYK:
      if (isStdDepth) {
        const key = channelsKey(channels, {
          [-1]: "A",
          0: "C",
          1: "M",
          2: "Y",
          3: "K",
        });
        if (key === "CMYK" || key === "ACMYK") {
          fmt = new PixelFormat(key2sign(key, depth));
        }
      }
      break;
    default:
      break;
  }

  if (!fmt) {
    throw new ErrorRI(
      "Unsupported PSD color mode: <mode>, <depth> bit/pixel, <n> channels",
      {
        mode: psdColorModeName[colorMode] ?? String(colorMode),
        depth,
        n: channels.length,
      }
    );
  }
  Object.assign(vars, extVars);
  return { size, fmt, vars };
};
