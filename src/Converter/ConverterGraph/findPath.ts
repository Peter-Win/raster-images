import { OldConverter } from "../OldConverter";
import { ConverterGraph } from "./ConverterGraph";
import { ConverterNode } from "./ConverterNode";

export const findPath = (
  srcSign: string,
  dstSign: string,
  graph: ConverterGraph
): OldConverter[] => {
  const first = graph[srcSign];
  const path: OldConverter[] = [];
  if (first) {
    Object.keys(graph).forEach((key) => {
      const node = graph[key];
      if (node) {
        node.distance = Number.MAX_SAFE_INTEGER;
        node.prevEdge = undefined;
      }
    });
    first.distance = 0;
    const queue: ConverterNode[] = [first];
    while (queue.length) {
      const curNode = queue.shift()!;
      if (curNode.sign === dstSign) {
        let edge = curNode.prevEdge;
        while (edge) {
          path.unshift(edge.converter);
          const prevNode = graph[edge.converter.srcSign];
          edge = prevNode?.prevEdge;
        }
        break;
      }
      curNode.edges.forEach((edge) => {
        const nextNode = graph[edge.converter.dstSign];
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
  return path;
};
