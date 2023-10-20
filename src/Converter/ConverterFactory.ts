import { Converter } from "./Converter";
import { ParamsConverter } from "./converters/ParamsConverter";

export interface ConverterProps {
  loss: boolean;
  dithering?: boolean;
  speed: number;
  quality: number;
}

export type ConverterFactory = (params: ParamsConverter) => Converter;

export type ConverterFactoryDescr = {
  srcSign: string;
  dstSign: string;
  props: ConverterProps;
  create: ConverterFactory;
  label?: string;
};

export const strCFDescr = ({
  srcSign,
  dstSign,
  label,
}: ConverterFactoryDescr): string =>
  `${srcSign} => ${dstSign}${label ? `, ${label}` : ""}`;
