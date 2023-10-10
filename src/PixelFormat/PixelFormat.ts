import { Sample, equalSamplesList } from "../Sample";
import { ColorModel } from "../ColorModel";
import { Palette } from "../Palette/Palette";
import { PixelDepth } from "../types";
import { PixelFormatDef } from "./PixelFormatDef";
import { analysePixelFormatDef } from "./analysePixelFormatDef";
import { parseSignature } from "./parseSignature";
import { defFromSamples } from "./defFromSamples";
import { signatureFromSamples } from "./signatureFromSamples";

export class PixelFormat {
  constructor();

  constructor(depth: PixelDepth, colorModel?: ColorModel, alpha?: boolean);

  constructor(def: PixelFormatDef);

  constructor(signature: string);

  constructor(samples: Sample[]);

  constructor(
    a?: PixelDepth | string | PixelFormatDef | Sample[],
    b?: ColorModel,
    c?: boolean
  ) {
    if (typeof a === "number") {
      const [def, samples] = analysePixelFormatDef({
        depth: a,
        colorModel: b || "Auto",
        alpha: c,
      });
      this.def = def;
      this.samples = samples;
    } else if (Array.isArray(a)) {
      this.samples = a;
      this.def = defFromSamples(a);
    } else if (typeof a === "object") {
      const [def, samples] = analysePixelFormatDef(a as PixelFormatDef);
      this.def = def;
      this.samples = samples;
    } else if (typeof a === "string") {
      this.samples = parseSignature(a);
      this.def = defFromSamples(this.samples);
    } else {
      this.def = { depth: 0, colorModel: "Unknown" };
      this.samples = [];
    }
  }

  readonly samples: Sample[];

  readonly def: PixelFormatDef;

  get alpha(): boolean {
    return !!this.def.alpha;
  }

  // color depth in bits per pixel. 24 for RGB(888) or 8 for std indexed
  get depth(): PixelDepth {
    return this.def.depth;
  }

  get depthAligned(): PixelDepth {
    const { depth } = this;
    return depth === 15 ? 16 : depth;
  }

  get colorModel(): ColorModel {
    return this.def.colorModel;
  }

  get palette(): Readonly<Palette> | undefined {
    return this.def.palette;
  }

  setPalette(pal?: Readonly<Palette>) {
    this.def.palette = pal;
  }

  get signature(): string {
    return signatureFromSamples(this.samples);
  }

  equals(other: PixelFormat): boolean {
    return (
      equalSamplesList(this.samples, other.samples) &&
      JSON.stringify(this.palette) === JSON.stringify(other.palette)
    );
  }

  get sampleBitMasks(): BigInt[] {
    return this.samples.map(
      (sd) => BigInt((1 << sd.length) - 1) << BigInt(sd.shift)
    );
  }

  toString(): string {
    return this.signature;
  }

  static readonly canvas = new PixelFormat("R8G8B8A8");
}
