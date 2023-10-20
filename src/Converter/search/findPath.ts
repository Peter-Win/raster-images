import { ErrorRI } from "../../utils";
import { ConverterGraph } from "./ConverterGraph";
import { ConverterNode } from "./ConverterNode";
import { ConverterFactoryDescr } from "../ConverterFactory";

const resetGraph = (graph: ConverterGraph) => {
  Object.keys(graph).forEach((key) => {
    const node = graph[key];
    if (node) {
      node.distance = Number.MAX_SAFE_INTEGER;
      node.prevEdge = undefined;
    }
  });
};

export const findPath = (
  srcSign: string,
  dstSign: string,
  graph: ConverterGraph
): ConverterFactoryDescr[] | undefined => {
  const first = graph[srcSign];
  const path: ConverterFactoryDescr[] = [];
  if (first) {
    resetGraph(graph);
    first.distance = 0;
    const queue: ConverterNode[] = [first];
    while (queue.length) {
      const curNode = queue.shift()!;
      if (curNode.sign === dstSign) {
        let edge = curNode.prevEdge;
        while (edge) {
          path.unshift(edge.descr);
          const prevNode = graph[edge.descr.srcSign];
          edge = prevNode?.prevEdge;
        }
        break;
      }
      curNode.edges.forEach((edge) => {
        const nextNode = graph[edge.descr.dstSign];
        if (nextNode) {
          const nextDistance = curNode.distance + 1;
          if (nextNode.distance > nextDistance) {
            nextNode.distance = nextDistance;
            nextNode.prevEdge = edge;
            queue.push(nextNode);
          }
        }
      });
    }
  }
  return path.length > 0 ? path : undefined;
};

export const findPathEx = (
  srcSign: string,
  dstSign: string,
  graph: ConverterGraph
): ConverterFactoryDescr[] => {
  const path = findPath(srcSign, dstSign, graph);
  if (!path) {
    throw new ErrorRI("Can't find converter from <src> to <dst>", {
      src: srcSign,
      dst: dstSign,
    });
  }
  return path;
};
