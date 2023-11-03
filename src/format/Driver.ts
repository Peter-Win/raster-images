import { PixelFormat } from "../PixelFormat";
import { OptionsCreateConverter } from "../Converter";
import { RAStream } from "../stream/RAStream";
import { BitmapFormat } from "./BitmapFormat";
import { FormatForSave } from "./FormatForSave";
import { FormatProps } from "./FormatProps";

export type OptionsSave = OptionsCreateConverter & {
  dstPixFmt?: PixelFormat;
};

export interface Driver {
  readonly name: string;
  readonly shortName: string;
  readonly extensions: readonly string[];
  readonly props: Set<FormatProps>;
  // Auto detection of raster format. true, if format can be reading by driver.
  detect(stream: RAStream): Promise<boolean>;
  createFormat(stream: RAStream): Promise<BitmapFormat>;

  // Saving
  save?(
    format: FormatForSave,
    stream: RAStream,
    options?: OptionsSave
  ): Promise<void>;
}
