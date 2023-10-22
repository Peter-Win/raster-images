import { Variables, getVarNumber } from "../../../ImageInfo/Variables";
import { ResolutionUnit } from "../../../ImageInfo/resolution";
import { bmpOs2 } from "../bmpCommon";

export type OptionsSaveBmp = {
  os2?: boolean; // use OS/2 BMP format
  rowOrder?: "forward" | "backward";
  importantColors?: number;
  resX?: number;
  resY?: number;
  resUnit?: ResolutionUnit;
};

export const makeOptionsSaveBmp = (
  vars?: Variables
): OptionsSaveBmp | undefined => {
  if (!vars) return undefined;
  const op: OptionsSaveBmp = {};
  if (vars.format === bmpOs2) op.os2 = true;
  if (vars.rowOrder === "forward" || vars.rowOrder === "backward")
    op.rowOrder = vars.rowOrder;
  const importantColors = getVarNumber(vars.importantColors, 0);
  if (importantColors) op.importantColors = importantColors;
  const resX = getVarNumber(vars.resX, 0);
  if (resX) op.resX = resX;
  const resY = getVarNumber(vars.resY, 0);
  if (resY) op.resY = resY;
  if (vars.resUnit) op.resUnit = vars.resUnit as ResolutionUnit;
  return op;
};
