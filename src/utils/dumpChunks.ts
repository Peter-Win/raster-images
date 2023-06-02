import { dumpA } from "./dump";

export const dumpChunks = (chunkLength: number, buf: Uint8Array): string[] => {
  const chunks: number[][] = [];
  buf.forEach((n, i) => {
    if (i % chunkLength === 0) {
      chunks.push([]);
    }
    chunks[chunks.length - 1]!.push(n);
  });
  return chunks.map((chunk) => dumpA(chunk));
};
