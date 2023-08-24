import { Converter } from "../Converter";

export interface ConverterEdge {
  converter: Converter;
}

export interface ConverterNode {
  sign: string;
  edges: ConverterEdge[];
  distance: number;
  prevEdge?: ConverterEdge;
}
