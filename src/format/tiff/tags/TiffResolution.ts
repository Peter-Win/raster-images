import { RAStream } from "../../../stream";
import { Ifd } from "../ifd/Ifd";
import { Variables } from "../../../ImageInfo/Variables";
import { getIfdSingleNumber } from "../ifd/IfdEntry";
import { ResolutionUnit } from "../../../ImageInfo/resolution";
import { TiffTag } from "../TiffTag";

export const enum TiffResolutionUnit {
  Relative = 1,
  Inch = 2,
  Centimeter = 3,
}

const unitsTiffToStd: Partial<Record<TiffResolutionUnit, ResolutionUnit>> = {
  [TiffResolutionUnit.Inch]: "inch",
  [TiffResolutionUnit.Centimeter]: "cm",
};

export const getTiffResolution = async (
  ifd: Ifd,
  stream: RAStream,
  littleEndian: boolean
): Promise<Variables | undefined> => {
  const eResX = ifd.entries[TiffTag.XResolution];
  const eResY = ifd.entries[TiffTag.YResolution];
  const eResUnit = ifd.entries[TiffTag.ResolutionUnit];
  if (!eResX || !eResY) return undefined;
  const unitId: TiffResolutionUnit = !eResUnit
    ? TiffResolutionUnit.Inch
    : ((await getIfdSingleNumber(
        eResUnit,
        stream,
        littleEndian
      )) as TiffResolutionUnit);
  const resUnit = unitsTiffToStd[unitId];
  if (!resUnit) return undefined;
  return {
    resX: await getIfdSingleNumber(eResX, stream, littleEndian),
    resY: await getIfdSingleNumber(eResY, stream, littleEndian),
    resUnit,
  };
};
