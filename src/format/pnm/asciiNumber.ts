import { ErrorRI } from "../../utils";

const rxNumber = /\d+/;

export const asciiNumber = (
  sValue: string,
  what: string = "number"
): number => {
  if (!rxNumber.test(sValue)) {
    throw new ErrorRI(`Invalid ${what}: "<s>"`, { s: sValue });
  }
  return +sValue;
};

export const checkInterval = (
  name: string,
  value: number,
  maxValue: number,
  minValue: number = 0
) => {
  if (value > maxValue || value < minValue) {
    throw new ErrorRI(`${name} = <value> must be in [<minValue>, <maxValue>]`, {
      value,
      maxValue,
      minValue,
    });
  }
};
