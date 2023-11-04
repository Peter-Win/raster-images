import { ImageInfo } from "../../ImageInfo";
import { ErrorRI } from "../../utils";
import { OptionsTarga } from "./OptionsTarga";
import {
  TargaDepth,
  TargaHeader,
  TargaImageType,
  makeTargaImageDescriptor,
} from "./TargaHeader";
import { orgAndSizeToTarga } from "./targaOrg";

const imageTypesMap: Record<string, TargaImageType> = {
  I8: TargaImageType.uncompressedColorMapped,
  "RLE I8": TargaImageType.rleColorMapped,
  G8: TargaImageType.uncompressedGray,
  B5G5R5: TargaImageType.uncompressedTrueColor,
  "RLE B5G5R5": TargaImageType.rleTrueColor,
  B8G8R8: TargaImageType.uncompressedTrueColor,
  "RLE B8G8R8": TargaImageType.rleTrueColor,
  B8G8R8A8: TargaImageType.uncompressedTrueColor,
  "RLE B8G8R8A8": TargaImageType.rleTrueColor,
  "RLE G8": TargaImageType.rleGray,
};

/**
 *
 * @param info vars ignored. Use targaOptionsFromVars, if need.
 * @param options
 */
export const makeTargaHeader = (
  info: ImageInfo,
  options: OptionsTarga
): TargaHeader => {
  const { size, fmt } = info;
  const { palette, alpha, signature, depth } = fmt;
  let colorItemSize = 0;
  if (palette) {
    colorItemSize = alpha ? 32 : 24;
  }
  const colorId = `${options.compression ? "RLE " : ""}${signature}`;
  const imageType = imageTypesMap[colorId];
  if (!imageType) {
    throw new ErrorRI("Invalid Targa image type: <t>", { t: colorId });
  }
  return {
    idLength: 0, // Image ID don't supported
    colorMapType: palette ? 1 : 0,
    imageType,
    colorMapStart: 0, // always 0
    colorMapLength: palette?.length ?? 0,
    colorItemSize,
    ...orgAndSizeToTarga(size, options),
    depth: (depth === 15 ? 16 : depth) as TargaDepth,
    imageDescriptor: makeTargaImageDescriptor(
      depth === 32 ? 8 : 0,
      !!options.top2bottom,
      options.right2left
    ),
  };
};
