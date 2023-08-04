import { BufferStream } from "./BufferStream";

/**
 * Поток использующий текстовую строку для чтения.
 * Для тестовых целей.
 */
export class TextReadStream extends BufferStream {
  constructor(text: string) {
    super(new Uint8Array(Array.from(text).map((c) => c.charCodeAt(0))));
  }

  async write(): // buffer: Uint8Array,
  // size?: number,
  // bufOffset?: number
  Promise<void> {
    throw new Error("Can't write into TextReadStream");
  }
}
