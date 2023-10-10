import { Palette, createFreePalette, isFreeColor } from "../../Palette";
import { Surface } from "../../Surface";
import { Box } from "./Box";
import {
  HistArray,
  HistParams,
  calcHistOffset,
  calcHistOffsetFast,
  createHistArray,
} from "./HistArray";
import { medianCut } from "./histUtils";
import { ErrorRI, rangeLimit } from "../../utils";
import { DitherCtx } from "../dithering/DitherCtx";

const MaxNumColors = 256;
const Bits = HistParams.bits; // bits of precision
const Shift = HistParams.shift;

const BOX_LOG = Bits - 3; // log2(hist cells in update box, Y axis)
const BOX_ELEMS = 1 << BOX_LOG; // # of hist cells in update box
const BOX_SHIFT = Shift + BOX_LOG;

export class Histogram {
  hist: HistArray;

  pal: Palette;

  isPalReady: boolean = false; // true: palette is ready, hist: color cache; false: hist: color histogram

  constructor() {
    this.hist = createHistArray();
    this.pal = [];
  }

  // analyse functions
  addColor(c0: number, c1: number, c2: number) {
    const histPos = calcHistOffset(c0, c1, c2);
    // increment, check for overflow and undo increment if so.
    // We assume unsigned representation here!
    if (++this.hist[histPos] === 0) this.hist[histPos]--;
  }

  addRowBGR(width: number, row: Uint8Array) {
    let pos = 0;
    const end = width * 3;
    while (pos < end) {
      const b = row[pos++]!;
      const g = row[pos++]!;
      const r = row[pos++]!;
      this.addColor(b, g, r);
    }
  }

  async addImageBGR(imgBGR: Surface) {
    const { signature } = imgBGR.info.fmt;
    if (signature !== "B8G8R8") {
      throw new ErrorRI("Invalid pixel format <fmt> in addImageBGR", {
        fmt: signature,
      });
    }
    const { width, height } = imgBGR;
    for (let y = 0; y < height; y++) {
      this.addRowBGR(width, imgBGR.getRowBuffer(y));
    }
  }

  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  addImage(img: Surface) {}

  // switch to conversion mode
  makePaletteN(colors: number = 0) {
    this.makePalette(createFreePalette(colors));
  }

  makePalette(pal0: Readonly<Palette>) {
    if (this.isPalReady) {
      // Если гистограмма уже в режиме конверсии, не выполнять формирование палитры по второму разу
      return;
    }
    this.isPalReady = true;

    let desiredColors = 0;
    if (pal0.length === 0) {
      // Если исходная таблица пуста, используем максимум цветов
      this.pal = createFreePalette(256);
      desiredColors = this.pal.length;
    } else {
      this.pal = [...pal0];
      const { length } = this.pal;
      for (let j = 0; j < length; j++) {
        if (isFreeColor(this.pal[j]!)) desiredColors++;
      }
      // Если палитра состоит только из предопределённых цветов, то гистограмма игнорируется
      if (desiredColors === 0) {
        this.hist.fill(0);
        return;
      }
    }
    const boxList: Box[] = [Box.createMax()];
    // Shrink it to actually-used volume and set its statistics
    boxList[0]!.update(this.hist);
    // Perform median-cut to produce final box list
    medianCut(desiredColors, this.hist, boxList);

    // Возможно, требуется сократить размер палитры...
    if (boxList.length < this.pal.length)
      this.pal = this.pal.slice(0, boxList.length);

    // Заполнить нулевые элементы палитры
    let i = 0;
    const N = boxList.length;
    const P = this.pal.length;
    for (let j = 0; j !== N; j++) {
      while (i !== P && !isFreeColor(this.pal[i]!)) i++;
      if (i === P) break; // wrong situation
      this.pal[i++] = boxList[j]!.computeColor(this.hist);
    }
    this.hist.fill(0);
  }

  // color conversion
  cvt(
    count: number,
    srcBuf: ArrayBuffer,
    srcByteOffset: number,
    dstBuf: ArrayBuffer,
    dstByteOffset: number
  ) {
    const src = new Uint8Array(srcBuf, srcByteOffset);
    const dst = new Uint8Array(dstBuf, dstByteOffset);
    let srcPos = 0;
    let dstPos = 0;
    const { hist } = this;
    while (dstPos < count) {
      const c0 = src[srcPos++]! >> Shift;
      const c1 = src[srcPos++]! >> Shift;
      const c2 = src[srcPos++]! >> Shift;
      const hp = calcHistOffsetFast(c0, c1, c2);
      if (hist[hp] === 0) {
        this.fillInverseCmap(c0, c1, c2);
      }
      dst[dstPos++] = hist[hp]! - 1;
    }
  }

  /**
   * conversion with Floyd-Steinberg dithering
   * можно было бы использовать createFloydSteinberg, т.к. используется тот же самый алгоритм
   * но такой вариант будет работать быстрее, т.к. он оптимизирован под конкретный случай.
   * @param count in pixels
   * @param srcBuf length = count * 3
   * @param srcByteOffset
   * @param dstBuf lenfth = count
   * @param dstByteOffset
   * @param ctx - the result of createFloydSteinberg8(width, 3)
   */
  cvtDither(
    count: number,
    srcBuf: ArrayBuffer,
    srcByteOffset: number,
    dstBuf: ArrayBuffer,
    dstByteOffset: number,
    ctx: DitherCtx
  ) {
    // This version performs Floyd-Steinberg dithering
    // Convert data to colormap indexes, which we save in output_workspace
    const src = new Uint8Array(srcBuf, srcByteOffset);
    const dst = new Uint8Array(dstBuf, dstByteOffset);
    const { hist } = this;
    ctx.startLine();
    for (let col = count; col > 0; col--) {
      const x = ctx.getX();
      const srcPos = x * 3;
      const c0 = ctx.getNew(0, src[srcPos]!);
      const c1 = ctx.getNew(1, src[srcPos + 1]!);
      const c2 = ctx.getNew(2, src[srcPos + 2]!);
      // Index into the cache with adjusted pixel value
      const cachep = calcHistOffset(c0, c1, c2);
      // If we have not seen this color before, find nearest colormap entry and update the cache
      if (hist[cachep] === 0) {
        this.fillInverseCmap(c0 >> Shift, c1 >> Shift, c2 >> Shift);
      }
      // Now emit the colormap index for this cell
      const pixcode = hist[cachep]! - 1;
      dst[x] = pixcode;
      // Compute representation error for this pixel
      const cc = this.pal[pixcode]!;
      if (!cc) {
        throw new ErrorRI("Invalid pallette index <n>. length=<L>", {
          n: pixcode,
          L: this.pal.length,
        });
      }
      ctx.setError(0, c0 - cc[0]);
      ctx.setError(1, c1 - cc[1]);
      ctx.setError(2, c2 - cc[2]);
      ctx.nextPixel();
    }
  }

  cvtDitherOld(
    count: number,
    srcBuf: ArrayBuffer,
    srcByteOffset: number,
    dstBuf: ArrayBuffer,
    dstByteOffset: number,
    evenrowerrs: Int16Array,
    oddrowerrs: Int16Array,
    onOddRow: boolean
  ) {
    // This version performs Floyd-Steinberg dithering
    // Convert data to colormap indexes, which we save in output_workspace
    const src = new Uint8Array(srcBuf, srcByteOffset);
    const dst = new Uint8Array(dstBuf, dstByteOffset);

    // eslint-disable-next-line prefer-const
    let [psrc, pdst, dir, thisrowerr, nextrowerr] = onOddRow
      ? [
          // work right to left in this row
          (count - 1) * 3,
          count - 1,
          -1,
          oddrowerrs,
          evenrowerrs,
        ]
      : [
          // work left to right in this row
          0,
          0,
          1,
          evenrowerrs,
          oddrowerrs,
        ];
    let thisPos = 3;
    let nextPos = count * 3;
    // need only initialize this one entry in nextrowerr
    nextrowerr.fill(0, nextPos, nextPos + 3);
    const { hist } = this;
    for (let col = count; col > 0; col--) {
      // For each component, get accumulated error and round to integer;
      // form pixel value + error, and range-limit to 0..MAXJSAMPLE.
      // RIGHT_SHIFT rounds towards minus infinity, so adding 8 is correct
      // for either sign of the error value.  Max error is +- MAXJSAMPLE.
      let c0 = (thisrowerr[thisPos]! + 8) >> 4;
      let c1 = (thisrowerr[thisPos + 1]! + 8) >> 4;
      let c2 = (thisrowerr[thisPos + 2]! + 8) >> 4;
      c0 += src[psrc]!;
      c1 += src[psrc + 1]!;
      c2 += src[psrc + 2]!;
      c0 = rangeLimit(c0);
      c1 = rangeLimit(c1);
      c2 = rangeLimit(c2);
      // Index into the cache with adjusted pixel value
      const cachep = calcHistOffset(c0, c1, c2);
      // If we have not seen this color before, find nearest colormap entry and update the cache
      if (hist[cachep] === 0) {
        this.fillInverseCmap(c0 >> Shift, c1 >> Shift, c2 >> Shift);
      }
      // Now emit the colormap index for this cell
      const pixcode = hist[cachep]! - 1;
      dst[pdst] = pixcode;
      // Compute representation error for this pixel
      const cc = this.pal[pixcode]!;
      c0 -= cc[0];
      c1 -= cc[1];
      c2 -= cc[2];
      // Propagate error to adjacent pixels
      // Remember that nextrowerr entries are in reverse order!
      let twoVal = c0 * 2;
      nextrowerr[nextPos - 3] = c0; // not +=, since not initialized yet
      c0 += twoVal; // form error * 3
      nextrowerr[nextPos + 3] += c0;
      c0 += twoVal; // form error * 5
      nextrowerr[nextPos] += c0;
      c0 += twoVal; // form error * 7
      thisrowerr[thisPos + 3] += c0;
      twoVal = c1 * 2;
      nextrowerr[nextPos + 1 - 3] = c1; // not +=, since not initialized yet
      c1 += twoVal; // form error * 3
      nextrowerr[nextPos + 1 + 3] += c1;
      c1 += twoVal; // form error * 5
      nextrowerr[nextPos + 1] += c1;
      c1 += twoVal; // form error * 7
      thisrowerr[thisPos + 4] += c1;
      twoVal = c2 * 2;
      nextrowerr[nextPos + 2 - 3] = c2; // not +=, since not initialized yet
      c2 += twoVal; // form error * 3
      nextrowerr[nextPos + 2 + 3] += c2;
      c2 += twoVal; // form error * 5
      nextrowerr[nextPos + 2] += c2;
      c2 += twoVal; // form error * 7
      thisrowerr[thisPos + 2 + 3] += c2;
      // Advance to next column
      psrc += dir * 3;
      pdst += dir;
      thisPos += 3; // cur-row error ptr advances to right
      nextPos -= 3; // next-row error ptr advances to left
    }
  }

  /**
   * Fill the inverse-colormap entries in the update box that contains histogram cell c0/c1/c2.
   * (Only that one cell MUST be filled, but we can fill as many others as we wish.)
   */
  protected fillInverseCmap(c0: number, c1: number, c2: number) {
    /* eslint no-param-reassign: "off" */
    /* Convert cell coordinates to update box ID */
    c0 >>= BOX_LOG;
    c1 >>= BOX_LOG;
    c2 >>= BOX_LOG;

    // Compute true coordinates of update box's origin corner.
    // Actually we compute the coordinates of the center of the corner
    // histogram cell, which are the lower bounds of the volume we care about.
    const minc0 = (c0 << BOX_SHIFT) + ((1 << Shift) >> 1);
    const minc1 = (c1 << BOX_SHIFT) + ((1 << Shift) >> 1);
    const minc2 = (c2 << BOX_SHIFT) + ((1 << Shift) >> 1);

    // Determine which colormap entries are close enough to be candidates
    // for the nearest entry to some cell in the update box.
    const colorlist = this.findNearbyColors(minc0, minc1, minc2);

    // Determine the actually nearest colors. */
    const bestcolor: number[] = this.findBestColors(
      minc0,
      minc1,
      minc2,
      colorlist
    );

    // Save the best color numbers (plus 1) in the main cache array
    c0 <<= BOX_LOG; // convert ID back to base cell indexes
    c1 <<= BOX_LOG;
    c2 <<= BOX_LOG;
    let cptr = 0; // bestcolor;
    const { hist } = this;
    for (let ic0 = 0; ic0 < BOX_ELEMS; ic0++) {
      for (let ic1 = 0; ic1 < BOX_ELEMS; ic1++) {
        let cachep = calcHistOffsetFast(c0 + ic0, c1 + ic1, c2);
        for (let ic2 = 0; ic2 < BOX_ELEMS; ic2++) {
          hist[cachep++] = bestcolor[cptr++]! + 1;
        }
      }
    }
  }

  /**
   * Locate the colormap entries close enough to an update box to be candidates
   * for the nearest entry to some cell(s) in the update box.  The update box
   * is specified by the center coordinates of its first cell.  The number of
   * candidate colormap entries is returned, and their colormap indexes are
   * placed in colorlist[].
   * This routine uses Heckbert's "locally sorted search" criterion to select
   * the colors that need further consideration.
   */
  protected findNearbyColors(
    minc0: number,
    minc1: number,
    minc2: number
  ): number[] {
    const numColors = this.pal.length;
    let minDist;
    let maxDist;
    let tdist;
    const minDistList = new Array<number>(MaxNumColors); // min distance to colormap entry i

    /* Compute true coordinates of update box's upper corner and center.
     * Actually we compute the coordinates of the center of the upper-corner
     * histogram cell, which are the upper bounds of the volume we care about.
     * Note that since ">>" rounds down, the "center" values may be closer to
     * min than to max; hence comparisons to them must be "<=", not "<".
     */
    const maxc0 = minc0 + ((1 << BOX_SHIFT) - (1 << Shift));
    const centerc0 = (minc0 + maxc0) >> 1;
    const maxc1 = minc1 + ((1 << BOX_SHIFT) - (1 << Shift));
    const centerc1 = (minc1 + maxc1) >> 1;
    const maxc2 = minc2 + ((1 << BOX_SHIFT) - (1 << Shift));
    const centerc2 = (minc2 + maxc2) >> 1;

    /* For each color in colormap, find:
     *  1. its minimum squared-distance to any point in the update box
     *     (zero if color is within update box);
     *  2. its maximum squared-distance to any point in the update box.
     * Both of these can be found by considering only the corners of the box.
     * We save the minimum distance for each color in mindist[];
     * only the smallest maximum distance is of interest.
     * Note we have to scale Y to get correct distance in scaled space.
     */
    let minMaxDist = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < numColors; i++) {
      // We compute the squared-c0-distance term, then add in the other two.
      let x: number = this.pal[i]![0]!;
      if (x < minc0) {
        tdist = x - minc0;
        minDist = tdist * tdist;
        tdist = x - maxc0;
        maxDist = tdist * tdist;
      } else if (x > maxc0) {
        tdist = x - maxc0;
        minDist = tdist * tdist;
        tdist = x - minc0;
        maxDist = tdist * tdist;
      } else {
        // within cell range so no contribution to min_dist
        minDist = 0;
        if (x <= centerc0) {
          tdist = x - maxc0;
          maxDist = tdist * tdist;
        } else {
          tdist = x - minc0;
          maxDist = tdist * tdist;
        }
      }

      x = this.pal[i]![1]!;
      if (x < minc1) {
        tdist = x - minc1;
        minDist += tdist * tdist;
        tdist = x - maxc1;
        maxDist += tdist * tdist;
      } else if (x > maxc1) {
        tdist = x - maxc1;
        minDist += tdist * tdist;
        tdist = x - minc1;
        maxDist += tdist * tdist;
      }
      // within cell range so no contribution to min_dist
      else if (x <= centerc1) {
        tdist = x - maxc1;
        maxDist += tdist * tdist;
      } else {
        tdist = x - minc1;
        maxDist += tdist * tdist;
      }

      x = this.pal[i]![2]!;
      if (x < minc2) {
        tdist = x - minc2;
        minDist += tdist * tdist;
        tdist = x - maxc2;
        maxDist += tdist * tdist;
      } else if (x > maxc2) {
        tdist = x - maxc2;
        minDist += tdist * tdist;
        tdist = x - minc2;
        maxDist += tdist * tdist;
      }
      // within cell range so no contribution to min_dist
      else if (x <= centerc2) {
        tdist = x - maxc2;
        maxDist += tdist * tdist;
      } else {
        tdist = x - minc2;
        maxDist += tdist * tdist;
      }

      minDistList[i] = minDist; // save away the results
      if (maxDist < minMaxDist) minMaxDist = maxDist;
    }

    // Now we know that no cell in the update box is more than minmaxdist
    // away from some colormap entry.  Therefore, only colors that are
    // within minmaxdist of some part of the box need be considered.
    const colorList: number[] = [];
    for (let i = 0; i < numColors; i++) {
      if (minDistList[i]! <= minMaxDist) colorList.push(i);
    }
    return colorList;
  }

  /**
   * Find the closest colormap entry for each cell in the update box,
   * given the list of candidate colors prepared by find_nearby_colors.
   * Return the indexes of the closest entries in the bestcolor[] array.
   * This routine uses Thomas' incremental distance calculation method to
   * find the distance from a colormap entry to successive cells in the box.
   */
  protected findBestColors(
    minc0: number,
    minc1: number,
    minc2: number,
    colorlist: number[]
  ): number[] {
    const numcolors = colorlist.length;

    // This array holds the actually closest colormap index for each cell.
    const bestcolor: number[] = [];

    // This array holds the distance to the nearest-so-far color for each cell
    const bestdist = new Array<number>(BOX_ELEMS * BOX_ELEMS * BOX_ELEMS);
    // Initialize best-distance for each cell of the update box
    bestdist.fill(Number.MAX_SAFE_INTEGER);

    // For each color selected by find_nearby_colors,
    // compute its distance to the center of each cell in the box.
    // If that's less than best-so-far, update best distance and color number.
    // Note we have to scale Y to get correct distance in scaled space.

    // Nominal steps between cell centers ("x" in Thomas article)
    const STEP = 1 << Shift;

    for (let i = 0; i < numcolors; i++) {
      const icolor = colorlist[i]!;
      // Compute (square of) distance from minc0/c1/c2 to this color
      const curColor = this.pal[icolor]!;
      let inc0 = minc0 - curColor[0]!;
      let inc1 = minc1 - curColor[1]!;
      let inc2 = minc2 - curColor[2]!;
      let dist0 = inc0 * inc0 + inc1 * inc1 + inc2 * inc2;
      // Form the initial difference increments
      inc0 = inc0 * (2 * STEP) + STEP * STEP;
      inc1 = inc1 * (2 * STEP) + STEP * STEP;
      inc2 = inc2 * (2 * STEP) + STEP * STEP;
      /* Now loop over all cells in box, updating distance per Thomas method */
      let bptr = 0; // bestdist position
      let cptr = 0; // bestcolor position
      let xx0 = inc0;
      for (let ic0 = BOX_ELEMS - 1; ic0 >= 0; ic0--) {
        let dist1 = dist0;
        let xx1 = inc1;
        for (let ic1 = BOX_ELEMS - 1; ic1 >= 0; ic1--) {
          let dist2 = dist1;
          let xx2 = inc2;
          for (let ic2 = BOX_ELEMS - 1; ic2 >= 0; ic2--) {
            if (dist2 < bestdist[bptr]!) {
              bestdist[bptr] = dist2;
              bestcolor[cptr] = icolor;
            }
            dist2 += xx2;
            xx2 += 2 * STEP * STEP;
            bptr++;
            cptr++;
          }
          dist1 += xx1;
          xx1 += 2 * STEP * STEP;
        }
        dist0 += xx0;
        xx0 += 2 * STEP * STEP;
      }
    }
    return bestcolor;
  }
}
