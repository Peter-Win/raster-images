import { Palette } from "../Palette";
import { OnProgressInfo } from "../transfer/ProgressInfo";
import { Surface } from "../Surface";
import { ImageInfo } from "../ImageInfo";

export interface RowsWriter {
  getBuffer(y: number): Promise<Uint8Array>;
  flushBuffer(y: number): Promise<void>;
  finish(): Promise<void>;
}

export interface RowsReader {
  readonly dstInfo: ImageInfo; // Для некоторых преобразований (например, с палитрой) эта инфа может меняться.
  readRow(y: number): Promise<Uint8Array>;
  finish(): Promise<void>;
}

export interface RowsReaderOptions {
  palette?: Readonly<Palette>;
}

export interface Converter {
  getRowsWriter(srcInfo: ImageInfo): Promise<RowsWriter>;
  getRowsReader(options?: RowsReaderOptions): Promise<RowsReader>;
  getSurface(options?: RowsReaderOptions): Promise<Surface>; // surface readonly
  progress?: OnProgressInfo;
}
