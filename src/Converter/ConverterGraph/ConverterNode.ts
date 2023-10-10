import { OldConverter } from "../OldConverter";

export interface ConverterEdge {
  converter: OldConverter;
}

export interface ConverterNode {
  sign: string;
  edges: ConverterEdge[];
  distance: number;
  prevEdge?: ConverterEdge;
}
