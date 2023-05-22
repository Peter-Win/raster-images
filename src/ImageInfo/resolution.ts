import { ErrorRI } from "../utils";

export type ResolutionUnit = "meter" | "cm" | "mm" | "inch";

const coeffDict: Record<ResolutionUnit, number> = {
  meter: 100,
  cm: 1,
  mm: 0.1,
  inch: 2.54,
};

const getCoeff = (resUnit: ResolutionUnit): number => {
  const k = coeffDict[resUnit];
  if (!k) throw new ErrorRI("Unknown resolution unit: <resUnit>", { resUnit });
  return k;
};

export const resolutionToMeters = (
  value: number,
  resUnit: ResolutionUnit
): number => {
  const k = getCoeff(resUnit);
  return (value * 100) / k;
};

export const resolutionFromMeters = (
  meters: number,
  resUnit: ResolutionUnit
): number => {
  const k = getCoeff(resUnit);
  return (meters * k) / 100;
};
