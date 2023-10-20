import { ConverterFactoryDescr } from "../ConverterFactory";
import { calcConverterWeight } from "./calcConverterWeight";
import { ConverterGraph } from "./ConverterGraph";
import { ConverterNode } from "./ConverterNode";
import { ConverterSearchProps } from "./ConverterSearchProps";

const createNode = (sign: string): ConverterNode => ({
  sign,
  edges: [],
  distance: 0,
});

export const buildConverterGraph = (
  props: ConverterSearchProps,
  descriptors: ConverterFactoryDescr[]
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

  descriptors.forEach((descr) => {
    const { srcSign, dstSign } = descr;
    const weight = calcConverterWeight(descr, props);
    if (weight > 0) {
      const node = cacheNode(srcSign);
      node.edges.push({ descr });
      cacheNode(dstSign); // Это нужно, чтобы в графе присутствовали оба формата (srcSign и dstSign)
    }
  });
  return graph;
};
