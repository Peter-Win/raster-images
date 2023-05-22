/**
 * Random Access Stream for NodeJS file
 */
import fs from "node:fs";
import { ErrorRI } from "../utils";
import { RAStream } from "./RAStream";

export class NodeJSFile implements RAStream {
  readonly name: string;

  handle?: fs.promises.FileHandle;

  private position = 0;

  private lockCounter = 0;

  /**
   * Создание объекта не означает открытие файла. Для этого нужно вызвать lock.
   * Большинство алгоритмов сами знают, кргда нужно вызывать lock/unlock.
   * @param fileName
   * @param flags
   */
  constructor(fileName: string, private flags: string | number = "r") {
    this.name = fileName;
  }

  protected async open(): Promise<void> {
    this.handle = await fs.promises.open(this.name, this.flags);
  }

  protected async close(): Promise<void> {
    this.handle?.close();
    this.handle = undefined;
  }

  protected onNonLocked(): never {
    throw new ErrorRI("Fileis not open: <f>", { f: this.name });
  }

  async lock(): Promise<void> {
    this.lockCounter++;
    if (this.lockCounter === 1) {
      await this.open();
    }
  }

  async unlock(): Promise<void> {
    this.lockCounter--;
    if (this.lockCounter === 0) {
      await this.close();
    }
  }

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
    const stat = await (this.handle
      ? this.handle.stat()
      : fs.promises.stat(this.name));
    return stat.size;
  }

  async read(size: number): Promise<Uint8Array> {
    const buf = new Uint8Array(size);
    await this.readBuffer(buf, size);
    return buf;
  }

  async readBuffer(
    buffer: Uint8Array,
    size: number,
    bufOffset?: number
  ): Promise<number> {
    if (!this.handle) this.onNonLocked();
    const { bytesRead } = await this.handle.read(
      buffer,
      bufOffset,
      size,
      this.position
    );
    this.position += bytesRead;
    return bytesRead;
  }

  async write(
    buffer: Uint8Array,
    size?: number,
    bufOffset?: number
  ): Promise<void> {
    if (!this.handle) this.onNonLocked();
    const realSize = size ?? buffer.byteLength;
    await this.handle.write(buffer, bufOffset, realSize, this.position);
    this.position += realSize;
  }

  async flush(): Promise<void> {
    if (this.handle) {
      this.handle.sync();
    }
  }
}
