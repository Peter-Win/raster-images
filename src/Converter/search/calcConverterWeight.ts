import { ConverterFactoryDescr } from "../ConverterFactory";
import { ConverterSearchProps } from "./ConverterSearchProps";

// вес от 0 до ~100.
// чем больше вес, тем конвертер лучше.
// Если 0, значит конвертер не соответствует требованиям и не будет использован.
export const calcConverterWeight = (
  { props }: ConverterFactoryDescr,
  searchProps: ConverterSearchProps
): number => {
  if (props.dithering && searchProps.dithering === false) return 0;
  return props[searchProps.prefer];
};
