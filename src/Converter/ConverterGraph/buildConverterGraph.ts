import { OldConverter } from "../OldConverter";
import { ConverterProps } from "../ConverterProps";
import { calcConverterWeight } from "./calcConverterWeight";
import { ConverterGraph } from "./ConverterGraph";
import { ConverterNode } from "./ConverterNode";

const createNode = (sign: string): ConverterNode => ({
  sign,
  edges: [],
  distance: 0,
});

export const buildConverterGraph = (
  props: ConverterProps,
  converters: OldConverter[]
): ConverterGraph => {
  const graph: ConverterGraph = {};

  const cacheNode = (sign: string): ConverterNode => {
    let node = graph[sign];
    if (!node) {
      node = createNode(sign);
      graph[sign] = node;
    }
    return node;
  };

  converters.forEach((converter) => {
    const { srcSign, dstSign } = converter;
    const weight = calcConverterWeight(converter, props);
    if (weight > 0) {
      const node = cacheNode(srcSign);
      node.edges.push({ converter });
      cacheNode(dstSign);
    }
  });
  return graph;
};
