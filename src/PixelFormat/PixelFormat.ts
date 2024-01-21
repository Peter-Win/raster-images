import { Sample, equalSamplesList } from "../Sample";
import { ColorModel } from "../ColorModel";
import { Palette, analyzePaletteTransparency } from "../Palette";
import { PixelDepth } from "../types";
import { PixelFormatDef } from "./PixelFormatDef";
import { analysePixelFormatDef } from "./analysePixelFormatDef";
import { parseSignature } from "./parseSignature";
import { defFromSamples } from "./defFromSamples";
import { signatureFromSamples } from "./signatureFromSamples";
import { ParcelPixelFormat } from "./ParcelPixelFormat";

export class PixelFormat {
  constructor();

  constructor(depth: PixelDepth, colorModel?: ColorModel, alpha?: boolean);

  constructor(depth: 1 | 2 | 4 | 8, palette: Readonly<Palette>);

  constructor(def: PixelFormatDef);

  constructor(signature: string);

  constructor(samples: Sample[], def?: PixelFormatDef);

  constructor(
    a?: PixelDepth | string | PixelFormatDef | Sample[],
    b?: ColorModel | PixelFormatDef | Readonly<Palette>,
    c?: boolean
  ) {
    if (typeof a === "number" && (!b || typeof b === "string")) {
      const [def, samples] = analysePixelFormatDef({
        depth: a,
        colorModel: b || "Auto",
        alpha: c,
      });
      this.def = def;
      this.samples = samples;
    } else if (typeof a === "number" && Array.isArray(b)) {
      const [def, samples] = analysePixelFormatDef({
        depth: a,
        palette: b,
        colorModel: "Indexed",
        alpha: analyzePaletteTransparency(b).type === "alpha",
      });
      this.samples = samples;
      this.def = def;
    } else if (Array.isArray(a) && (!b || typeof b === "object")) {
      this.samples = a;
      this.def = (b as PixelFormatDef) ?? defFromSamples(a);
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

  get maxSampleDepth(): number {
    return this.samples.reduce((acc, { length }) => Math.max(acc, length), 0);
  }

  /**
   * @returns undefined for pixel with different samples length (R5G6B5)
   */
  get bitsPerSample(): PixelDepth | undefined {
    const first = this.samples[0]?.length as PixelDepth | undefined;
    return this.samples
      .slice(1)
      .reduce(
        (res, samp) => (!res || samp.length === res ? res : undefined),
        first
      );
  }

  toString(): string {
    return this.signature;
  }

  static readonly canvas = new PixelFormat("R8G8B8A8");

  toParcel(): ParcelPixelFormat {
    return {
      def: this.def,
      samples: this.samples,
    };
  }

  static fromParcel({ samples, def }: ParcelPixelFormat): PixelFormat {
    return new PixelFormat(samples, def);
  }
}
