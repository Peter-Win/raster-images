// К сожалению, Blob имеет разную релализацию в браузере и в NodeJS
// Поэтому потребовался такой костыль.

import { isNode } from "./isNode";

export interface CrossBlob {
  text(): Promise<string>;
}

/* eslint-disable global-require */
/* eslint-disable no-empty */

export const createCrossBlob = (chunks: Uint8Array[]): CrossBlob => {
  try {
    if (isNode()) {
      // special case of Blob for NodeJS
      // may need to be added to webpack config:
      //    resolve: { fallback: { "buffer": false } }

      // @ts-ignore
      const { Blob: NodeBlob } = require("buffer");
      return new NodeBlob(chunks) as unknown as CrossBlob;
    }
  } catch (e) {}

  return new Blob(chunks);
};
