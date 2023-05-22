import { RAStream } from "../stream/RAStream";
import { BitmapFormat } from "./BitmapFormat";
import { FormatProps } from "./FormatProps";

export interface Driver {
  readonly name: string;
  readonly shortName: string;
  readonly extensions: readonly string[];
  readonly props: Set<FormatProps>;
  // Auto detection of raster format. true, if format can be reading by driver.
  detect(stream: RAStream): Promise<boolean>;
  createFormat(stream: RAStream): Promise<BitmapFormat>;

  // Saving
  // save(format: FormatForSave): Promise<void>;
}
