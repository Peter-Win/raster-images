/**
 * Use buffer as Random Access stream
 * Желательно использовать его для тестирования, а не для продакшн.
 * Лучше всего использовать для чтения.
 * Для записи тоже можно, но в текущей реализации буфер не увеличивается и при выходе за границы будет ошибка.
 */

import { RAStream } from "./RAStream";
import { copyBytes } from "../cvt/copy/copyBytes";

export class BufferStream implements RAStream {
  readonly name: string;

  private position = 0;

  private size: number; // Если поток для чтения, то размер равен размеру буфера (указывать не надо).

  // Если для записи, то имеет смысл установить size=0
  constructor(
    public buffer: Uint8Array,
    params?: { size?: number; name?: string }
  ) {
    this.name = params?.name || "Buffer";
    this.size = params?.size ?? buffer.byteLength;
  }

  readonly lock = () => Promise.resolve();

  readonly unlock = () => Promise.resolve();

  async seek(position: number): Promise<void> {
    this.position = position;
  }

  async skip(delta: number): Promise<number> {
    this.position += delta;
    return this.position;
  }

  async getPos(): Promise<number> {
    return this.position;
  }

  async getSize(): Promise<number> {
    return this.size;
  }

  async read(size: number): Promise<Uint8Array> {
    const end = this.position + size;
    const res = this.buffer.slice(this.position, end);
    this.position = end;
    return res;
  }

  async readBuffer(
    buffer: Uint8Array,
    size: number,
    bufOffset?: number
  ): Promise<number> {
    copyBytes(size, this.buffer, this.position, buffer, bufOffset ?? 0);
    return size;
  }

  async write(
    buffer: Uint8Array,
    size?: number,
    bufOffset?: number
  ): Promise<void> {
    const realSize = size ?? buffer.byteLength;
    copyBytes(realSize, buffer, bufOffset ?? 0, this.buffer, this.position);
    this.position += realSize;
    this.size = Math.max(this.size, this.position);
  }

  flush = () => Promise.resolve();
}
