import { copyBytes } from "../../Converter/rowOps/copy/copyBytes";
import { getPngFilterByValue } from "./PngFilter";

export class PngRowFiltrator {
  // два буфера - текущий и предыдущий. Переключаются по очереди
  buffs: [Uint8Array, Uint8Array];

  curBufIndex = 0;

  constructor(
    public readonly pixelSize: number,
    public readonly lineSize: number
  ) {
    this.buffs = [
      new Uint8Array(pixelSize + lineSize),
      new Uint8Array(pixelSize + lineSize),
    ];
  }

  unfilterRow(
    filterType: number,
    srcBuf: Uint8Array,
    srcOffs: number,
    bytesCount: number
  ): [Uint8Array, number] {
    const { pixelSize, buffs, curBufIndex } = this;
    const { unfilter } = getPngFilterByValue(filterType);
    const curBuf = buffs[curBufIndex]!;
    copyBytes(bytesCount, srcBuf, srcOffs, curBuf, pixelSize);
    unfilter?.({
      pixelSize,
      lineSize: bytesCount + pixelSize,
      buf: curBuf,
      pos: 0,
      prevLine: buffs[curBufIndex ^ 1]!,
      prevPos: 0,
    });
    return [curBuf, pixelSize];
  }

  next() {
    this.curBufIndex ^= 1;
  }
}
