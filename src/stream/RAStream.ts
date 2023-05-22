/**
 * Random Access Stream
 * Для обеспечения независимости от реализации файловых операций.
 * Поток данных с произвольным доступом.
 */
export interface RAStream {
  readonly name: string;
  lock(): Promise<void>;
  unlock(): Promise<void>;
  seek(position: number): Promise<void>;
  skip(delta: number): Promise<number>;
  getPos(): Promise<number>;
  getSize(): Promise<number>;
  read(size: number): Promise<Uint8Array>;
  readBuffer(
    buffer: Uint8Array,
    size: number,
    bufOffset?: number
  ): Promise<number>;
  write(buffer: Uint8Array, size?: number, bufOffset?: number): Promise<void>;
  flush(): Promise<void>;
}
