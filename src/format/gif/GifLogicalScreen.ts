// Flags
// Global Color Table Flag - 1 Bit
// Color Resolution - 3 Bits
// Sort Flag - 1 Bit

import { RAStream } from "../../stream";

// Size of Global Color Table - 3 Bits
const maskGlobalTable = 0x80;
const maskColorResolution = 0x70;
const shiftColorResolution = 4;
const maskSorted = 0x08;
const maskColorTableSize = 0x07;

const ofsWidth = 0;
const ofsHeight = ofsWidth + 2;
const ofsFlags = ofsHeight + 2;
const ofsBgIndex = ofsFlags + 1;
const ofsAspectRatio = ofsBgIndex + 1;
export const sizeOfDescriptor = ofsAspectRatio + 1;

export class GifLogicalScreen {
  width: number = 0;

  height: number = 0;

  flags: number = 0;

  /**
   * Background Color Index - Index into the Global Color Table for the Background Color.
   * The Background Color is the color used for those pixels on the screen that are not covered by an image.
   * If the Global Color Table Flag is set to (zero), this field should be zero and should be ignored.
   */
  bgIndex: number = 0;

  aspectRatio: number = 0;

  get isGlobalTable(): boolean {
    return (this.flags & maskGlobalTable) !== 0;
  }

  /**
   * If the flag is set, the Global Color Table is sorted, in order of decreasing importance.
   * Typically, the order would be decreasing frequency, with most frequent color first.
   * This assists a decoder, with fewer available colors, in choosing the best subset of colors;
   * the decoder may use an initial segment of the table to render the graphic.
   */
  get isSortedTable(): boolean {
    return (this.flags & maskSorted) !== 0;
  }

  get colorResolution(): number {
    return ((this.flags & maskColorResolution) >> shiftColorResolution) + 1;
  }

  get tableSize(): number {
    return 1 << ((this.flags & maskColorTableSize) + 1);
  }

  getBgIndex(): number | undefined {
    return this.isGlobalTable ? this.bgIndex : undefined;
  }

  getAspectRatio(): number | undefined {
    // Pixel Aspect Ratio - Factor used to compute an approximation
    //     of the aspect ratio of the pixel in the original image.  If the
    //     value of the field is not 0, this approximation of the aspect ratio
    //     is computed based on the formula:

    //     Aspect Ratio = (Pixel Aspect Ratio + 15) / 64
    return this.aspectRatio === 0 ? undefined : (this.aspectRatio + 15) / 64;
  }

  readFromBuf(buf: Uint8Array) {
    const dv = new DataView(buf.buffer, buf.byteOffset);
    this.width = dv.getUint16(ofsWidth, true);
    this.height = dv.getUint16(ofsHeight, true);
    this.flags = dv.getInt8(ofsFlags);
    this.bgIndex = dv.getUint8(ofsBgIndex);
    this.aspectRatio = dv.getUint8(ofsAspectRatio);
  }

  static async read(stream: RAStream): Promise<GifLogicalScreen> {
    const inst = new GifLogicalScreen();
    inst.readFromBuf(await stream.read(sizeOfDescriptor));
    return inst;
  }

  writeToBuf(): Uint8Array {
    const buf = new Uint8Array(sizeOfDescriptor);
    const dv = new DataView(buf.buffer, buf.byteOffset);
    dv.setUint16(ofsWidth, this.width, true);
    dv.setUint16(ofsHeight, this.height, true);
    buf[ofsFlags] = this.flags;
    buf[ofsBgIndex] = this.bgIndex;
    buf[ofsAspectRatio] = this.aspectRatio;
    return buf;
  }

  async write(stream: RAStream) {
    await stream.write(this.writeToBuf());
  }

  static nearestValidPaletteProps(srcSize: number) {
    let code = 1;
    let testSize = srcSize - 1;
    for (let j = 0; j <= 8; j++, testSize >>= 1) {
      if (testSize & 1) code = j;
    }
    return {
      code,
      size: 1 << (code + 1),
    };
  }
}
