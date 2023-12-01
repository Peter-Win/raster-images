import { isNode } from "./isNode";

/* eslint global-require: "off" */

export type Encoding = "utf-8" | "windows-1251";

const decoders: Partial<Record<Encoding, TextDecoder>> = {};

export const decode = (
  bytes: Uint8Array,
  encoding: Encoding = "utf-8"
): string => {
  let decoder = decoders[encoding];
  if (!decoder) {
    if (isNode()) {
      // may need to be added to webpack config:
      //    resolve: { fallback: { "buffer": false } }
      // @ts-ignore
      const util = require("util");
      decoder = new util.TextDecoder(encoding);
    } else {
      decoder = new TextDecoder(encoding);
    }
    decoders[encoding] = decoder;
  }
  return decoder!.decode(bytes);
};

// В отличие от декодера, здесь встроенные функции не поддерживают никаких других кодировок, кроме UTF-8

let encoder: TextEncoder;

export const encode = (text: string): Uint8Array => {
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
