import { Variables } from "../../../ImageInfo/Variables";
import { parseStrTime } from "../../../ImageInfo/timeInfo";

export const enum PngPackLevelStd {
  default = -1,
  noCompression = 0,
  bestSpeed = 1,
  bestCompression = 9,
}
export type PngPackLevelN = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type PngPackLevel = PngPackLevelStd | PngPackLevelN;

export interface OptionsSavePng {
  level?: PngPackLevel; // if not specified: PngPackLevelStd.default
  modificationTime?: Date;
}

/**
 *
 * @param {string} vars.modificationTime "YYYY-MM-DD hh:mm:ss" | "YYYY-MM-DD"
 * @param {number} vars.packLevel PngPackLevelStd.default .. PngPackLevelStd.bestCompression
 * @returns
 */
export const makeOptionsSavePng = (
  vars?: Variables
): OptionsSavePng | undefined => {
  if (!vars) return undefined;
  const op: OptionsSavePng = {};
  const { modificationTime, packLevel } = vars;
  if (typeof modificationTime === "string") {
    op.modificationTime = parseStrTime(modificationTime);
  }
  if (typeof packLevel === "number" && packLevel >= -1 && packLevel <= 9) {
    op.level = packLevel as PngPackLevelN;
  }
  return op;
};
