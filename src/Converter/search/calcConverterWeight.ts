import { ConverterFactoryDescr } from "../ConverterFactory";
import { ConverterSearchProps } from "./ConverterSearchProps";

// вес от 0 до ~100.
// чем больше вес, тем конвертер лучше.
// Если 0, значит конвертер не соответствует требованиям и не будет использован.
export const calcConverterWeight = (
  _descriptor: ConverterFactoryDescr,
  _props: ConverterSearchProps
): number =>
  // TODO: пока заглушка
  100;
