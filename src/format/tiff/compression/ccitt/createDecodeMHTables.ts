import {
  MHDecodeDict,
  createDecodeTermDict,
  createDecodeMakeUpDict,
  createAddMakeUpDict,
} from "./mhCodes";

export interface DecodeModifiedHuffmanTables {
  term: [MHDecodeDict, MHDecodeDict];
  mkUp: [MHDecodeDict, MHDecodeDict];
  addMkUp: MHDecodeDict;
}

export const createDecodeMHTables = (): DecodeModifiedHuffmanTables => ({
  term: createDecodeTermDict(),
  mkUp: createDecodeMakeUpDict(),
  addMkUp: createAddMakeUpDict(),
});
