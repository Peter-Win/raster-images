import { isNode } from "./isNode";

/* eslint global-require: "off" */

let decoder: TextDecoder;

export const bytesToUtf8 = (bytes: Uint8Array): string => {
  if (!decoder) {
    if (isNode()) {
      // may need to be added to webpack config:
      //    resolve: { fallback: { "buffer": false } }
      // @ts-ignore
      const util = require("util");
      decoder = new util.TextDecoder("utf8");
    } else {
      decoder = new TextDecoder("utf8");
    }
  }
  return decoder.decode(bytes);
};

let encoder: TextEncoder;

export const utf8ToBytes = (text: string): Uint8Array => {
  if (!encoder) {
    if (isNode()) {
      // @ts-ignore
      const util = require("util");
      encoder = new util.TextEncoder();
    } else {
      encoder = new TextEncoder();
    }
  }
  return encoder.encode(text);
};
