import { ConverterFactoryDescr } from "../ConverterFactory";

export interface ConverterEdge {
  descr: ConverterFactoryDescr;
}

export interface ConverterNode {
  sign: string;
  edges: ConverterEdge[];
  distance: number;
  prevEdge?: ConverterEdge;
  used?: boolean;
}
