import { Variables } from "../../ImageInfo/Variables";

export interface OptionsTarga {
  top2bottom?: boolean;
  right2left?: boolean;
  compression?: boolean;
  orgX?: number;
  orgY?: number;
}

export const targaOptionsToVars = ({
  compression,
  right2left,
  top2bottom,
  orgX,
  orgY,
}: OptionsTarga): Variables => {
  const vars: Variables = {
    rowsOrder: top2bottom ? "forward" : "backward",
  };
  if (right2left) vars.rightToLeft = 1;
  if (orgX !== undefined) vars.orgX = orgX;
  if (orgY !== undefined) vars.orgY = orgY;
  if (compression) vars.compression = "RLE";
  return vars;
};
