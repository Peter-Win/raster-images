import { PaletteItem } from "../../Palette";
import { HistArray, HistParams, calcHistOffsetFast } from "./HistArray";

export type Axis = 0 | 1 | 2;

export class Box {
  // The bounds of the box (inclusive); expressed as histogram indexes
  c0min = 0;

  c0max: number;

  c1min = 0;

  c1max: number;

  c2min = 0;

  c2max: number;

  // The number of nonzero histogram cells within this box
  private colorcount = 0;

  static createMax(): Box {
    const m = HistParams.maxElem;
    return new Box(m, m, m);
  }

  constructor(srcBox: Box);

  constructor(max0?: number, max1?: number, max2?: number);

  constructor(a?: Box | number, b?: number, c?: number) {
    if (typeof a === "object") {
      this.c0min = a.c0min;
      this.c0max = a.c0max;
      this.c1min = a.c1min;
      this.c1max = a.c1max;
      this.c2min = a.c2min;
      this.c2max = a.c2max;
      this.colorcount = a.colorcount;
    } else {
      this.c0max = a ?? 0;
      this.c1max = b ?? 0;
      this.c2max = c ?? 0;
    }
  }

  get isValid(): boolean {
    return (
      this.c0max > this.c0min ||
      this.c1max > this.c1min ||
      this.c2max > this.c2min
    );
  }

  get colorCount(): number {
    return this.colorcount;
  }

  get norm(): number {
    const d0 = this.c0max - this.c0min;
    const d1 = this.c1max - this.c1min;
    const d2 = this.c2max - this.c2min;
    return d0 * d0 + d1 * d1 + d2 * d2;
  }

  get longestAxis(): Axis {
    let n: Axis = 0;
    const c0 = this.c0max - this.c0min;
    const c1 = this.c1max - this.c1min;
    const c2 = this.c2max - this.c2min;
    let cmax = c0;
    if (c1 > cmax) {
      cmax = c1;
      n = 1;
    }
    if (c2 > cmax) {
      n = 2;
    }
    return n;
  }

  update(hist: HistArray) {
    let { c0min, c0max, c1min, c1max, c2min, c2max } = this;

    /* eslint no-labels: "off", no-multi-assign: "off" */
    if (c0max > c0min) {
      haveC0min: for (let c0 = c0min; c0 <= c0max; c0++) {
        for (let c1 = c1min; c1 <= c1max; c1++) {
          let histp = calcHistOffsetFast(c0, c1, c2min);
          for (let c2 = c2min; c2 <= c2max; c2++) {
            if (hist[histp++] !== 0) {
              this.c0min = c0min = c0;
              break haveC0min;
            }
          }
        }
      }
    }

    if (c0max > c0min) {
      haveC0max: for (let c0 = c0max; c0 >= c0min; c0--) {
        for (let c1 = c1min; c1 <= c1max; c1++) {
          let histp: number = calcHistOffsetFast(c0, c1, c2min);
          for (let c2 = c2min; c2 <= c2max; c2++) {
            if (hist[histp++] !== 0) {
              this.c0max = c0max = c0;
              break haveC0max;
            }
          }
        }
      }
    }

    if (c1max > c1min) {
      haveC1min: for (let c1 = c1min; c1 <= c1max; c1++) {
        for (let c0 = c0min; c0 <= c0max; c0++) {
          let histp = calcHistOffsetFast(c0, c1, c2min);
          for (let c2 = c2min; c2 <= c2max; c2++) {
            if (hist[histp++] !== 0) {
              this.c1min = c1min = c1;
              break haveC1min;
            }
          }
        }
      }
    }

    if (c1max > c1min) {
      haveC1max: for (let c1 = c1max; c1 >= c1min; c1--) {
        for (let c0 = c0min; c0 <= c0max; c0++) {
          let histp = calcHistOffsetFast(c0, c1, c2min);
          for (let c2 = c2min; c2 <= c2max; c2++) {
            if (hist[histp++] !== 0) {
              this.c1max = c1max = c1;
              break haveC1max;
            }
          }
        }
      }
    }

    if (c2max > c2min) {
      haveC2min: for (let c2 = c2min; c2 <= c2max; c2++) {
        for (let c0 = c0min; c0 <= c0max; c0++) {
          let histp = calcHistOffsetFast(c0, c1min, c2);
          for (let c1 = c1min; c1 <= c1max; c1++, histp += HistParams.elems) {
            if (hist[histp] !== 0) {
              this.c2min = c2min = c2;
              break haveC2min;
            }
          }
        }
      }
    }

    if (c2max > c2min) {
      haveC2max: for (let c2 = c2max; c2 >= c2min; c2--) {
        for (let c0 = c0min; c0 <= c0max; c0++) {
          let histp = calcHistOffsetFast(c0, c1min, c2);
          for (let c1 = c1min; c1 <= c1max; c1++, histp += HistParams.elems) {
            if (hist[histp] !== 0) {
              this.c2max = c2max = c2;
              break haveC2max;
            }
          }
        }
      }
    }

    // Now scan remaining volume of box and compute population
    let ccount = 0;
    for (let c0 = c0min; c0 <= c0max; c0++) {
      for (let c1 = c1min; c1 <= c1max; c1++) {
        let histp = calcHistOffsetFast(c0, c1, c2min);
        for (let c2 = c2min; c2 <= c2max; c2++, histp++)
          if (hist[histp] !== 0) {
            ccount++;
          }
      }
    }
    this.colorcount = ccount;
  }

  split(n: Axis, hist: HistArray): Box {
    let lb: number;
    const b2 = new Box(this);
    // eslint-disable-next-line default-case
    switch (n) {
      case 0:
        lb = (this.c0max + this.c0min) >> 1;
        this.c0max = lb;
        b2.c0min = lb + 1;
        break;
      case 1:
        lb = (this.c1max + this.c1min) >> 1;
        this.c1max = lb;
        b2.c1min = lb + 1;
        break;
      case 2:
        lb = (this.c2max + this.c2min) >> 1;
        this.c2max = lb;
        b2.c2min = lb + 1;
        break;
    }
    // Update stats for boxes
    this.update(hist);
    b2.update(hist);
    return b2;
  }

  computeColor(hist: HistArray): PaletteItem {
    // Current algorithm: mean weighted by pixels (not colors)
    // Note it is important to get the rounding correct!
    let total = 0;
    let c0total = 0;
    let c1total = 0;
    let c2total = 0;

    const { c0min, c0max, c1min, c1max, c2min, c2max } = this;

    const shiftHi = HistParams.shift;
    const shiftLow = 8 - shiftHi * 2;
    for (let c0 = c0min; c0 <= c0max; c0++)
      for (let c1 = c1min; c1 <= c1max; c1++) {
        let histp = calcHistOffsetFast(c0, c1, c2min);
        for (let c2 = c2min; c2 <= c2max; c2++) {
          const count = hist[histp++]!;
          if (count !== 0) {
            total += count;
            c0total += ((c0 << shiftHi) + (c0 >> shiftLow)) * count;
            c1total += ((c1 << shiftHi) + (c1 >> shiftLow)) * count;
            c2total += ((c2 << shiftHi) + (c2 >> shiftLow)) * count;
            // такой вариант был в исходном коде
            // c0total += ((c0 << shiftHi) + ((1<<shiftHi)>>1)) * count;
            // c1total += ((c1 << shiftHi) + ((1<<shiftHi)>>1)) * count;
            // c2total += ((c2 << shiftHi) + ((1<<shiftHi)>>1)) * count;
            // но он давал 2 вместо 0 и 254 вместо 255
          }
        }
      }
    return [
      Math.floor((c0total + (total >> 1)) / total),
      Math.floor((c1total + (total >> 1)) / total),
      Math.floor((c2total + (total >> 1)) / total),
      255,
    ];
  }
}
