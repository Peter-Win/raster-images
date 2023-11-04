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

export const targaOptionsFromVars = (
  vars: Variables | undefined
): OptionsTarga => {
  const options: OptionsTarga = {};
  if (vars?.compression === "RLE") options.compression = true;
  if (vars?.rowsOrder === "forward") options.top2bottom = true;
  if (vars?.rightToLeft) options.right2left = true;
  if (vars?.orgX || vars?.orgY) {
    options.orgX = typeof vars?.orgX === "number" ? vars.orgX : 0;
    options.orgY = typeof vars?.orgY === "number" ? vars.orgY : 0;
  }
  return options;
};
