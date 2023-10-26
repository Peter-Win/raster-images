import { Variables } from "../../../ImageInfo/Variables";
import { PnmDataType } from "../pnmCommon";

export type OptionsSavePnm = {
  dataType?: PnmDataType; // default = raw
  comment?: string;
  maxRowLength?: number; // default = 70
};

export const makeOptionsSavePnm = (
  vars?: Variables
): OptionsSavePnm | undefined => {
  if (!vars) return undefined;
  const { dataType, comment, maxRowLength } = vars;
  const options: OptionsSavePnm = {};
  if (dataType === "raw" || dataType === "plain") {
    options.dataType = dataType;
  }
  if (typeof comment === "string") {
    options.comment = comment;
  }
  if (typeof maxRowLength === "number" && maxRowLength > 0) {
    options.maxRowLength = maxRowLength;
  }
  return vars;
};
