import { Variables } from "../../../ImageInfo/Variables";

export type FloatBitPerSample = 16 | 24;

export const getFloatBitPerSample = (
  vars?: Variables
): FloatBitPerSample | undefined => {
  const value = vars?.floatBitsPerSample;
  return value === 16 || value === 24 ? value : undefined;
};
