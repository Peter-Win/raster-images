import { Converter } from "../Converter";
import { ConverterProps } from "../ConverterProps";

// вес от 0 до ~100.
// чем больше вес, тем конвертер лучше.
// Если 0, значит конвертер не соответствует требованиям и не будет использован.
export const calcConverterWeight = (
  _converter: Converter,
  _props: ConverterProps
): number =>
  // TODO: пока заглушка
  100;
