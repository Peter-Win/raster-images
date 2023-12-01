import { encode, decode } from "./textCoder";

export const bytesToUtf8 = (bytes: Uint8Array): string => decode(bytes);

export const utf8ToBytes = (text: string): Uint8Array => encode(text);
