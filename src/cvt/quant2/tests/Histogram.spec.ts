import { createFreePalette, paletteEGA, iEGA, Palette } from "../../../Palette";
import { dump, dumpA } from "../../../utils";
import { HistParams, calcHistOffset } from "../HistArray";
import { Histogram } from "../Histogram";

describe("Histogram", () => {
  it("addColor", () => {
    const h = new Histogram();
    expect(h.hist.length).toBe(HistParams.size);
    h.addColor(0, 0, 0);
    expect(h.hist[0]).toBe(1);
    h.addColor(1, 1, 1);
    expect(h.hist[0]).toBe(2);
    h.addColor(3, 3, 3);
    expect(h.hist[0]).toBe(3);
    h.addColor(4, 4, 4);
    expect(h.hist[0]).toBe(3);
    expect(h.hist[64 * 64 + 64 + 1]).toBe(1);
    // overflow
    h.addColor(0, 0, 4);
    const offs = calcHistOffset(0, 0, 4);
    expect(h.hist[offs]).toBe(1);
    h.hist[offs] = 0xfffd;
    h.addColor(0, 0, 4);
    h.hist[offs] = 0xfffe;
    h.addColor(0, 0, 4);
    h.hist[offs] = 0xffff;
    h.addColor(0, 0, 4);
    h.hist[offs] = 0xffff;
  });

  it("makePaletteN", () => {
    const h = new Histogram();
    h.addColor(0, 0, 0); // black
    h.addColor(255, 0, 0); // blue
    h.addColor(0, 255, 0); // green
    h.addColor(0, 0, 255); // red
    h.makePaletteN(16);
    expect(h.pal.length).toBe(4);
    expect(h.pal[0]).toEqual([0, 0, 0, 255]);
    expect(h.pal[1]).toEqual([255, 0, 0, 255]);
    expect(h.pal[2]).toEqual([0, 255, 0, 255]);
    expect(h.pal[3]).toEqual([0, 0, 255, 255]);
  });
  it("makePaletteN limited", () => {
    const h = new Histogram();
    h.addColor(0, 0, 0); // black
    h.addColor(255, 0, 0); // hi blue
    h.addColor(191, 0, 0); // low blue
    h.addColor(0, 255, 0); // hi green
    h.addColor(0, 223, 0); // low green
    h.addColor(0, 0, 255); // hi red only
    // (191 + 255)/2 = 223  (BF+FF)/2=DF
    // (223 + 255)/2 = 239  (DF+FF)/2=EF
    // Однако такой результат будет не для всех значений
    // из-за того что в гистограмме учитываются только цвета, кратные 4
    h.makePaletteN(4);
    // console.log(h.pal);
    expect(h.pal.length).toBe(4);
    expect(h.pal[0]).toEqual([0, 0, 0, 255]);
    expect(h.pal[1]).toEqual([223, 0, 0, 255]);
    expect(h.pal[2]).toEqual([0, 239, 0, 255]);
    expect(h.pal[3]).toEqual([0, 0, 255, 255]);
  });

  xit("makePalette", () => {
    // TODO: Пока не готов нормальный способ учёта предопределенных цветов в палитре
    const pal = createFreePalette(256);
    pal[0] = [0, 0, 0, 255]; // predefined black
    pal[1] = [255, 255, 255, 255]; // predefined white
    const h = new Histogram();
    h.addColor(1, 1, 1); // rounded to 0,0,0
    h.addColor(0, 0, 255); // red
    h.addColor(0, 255, 0); // green
    h.addColor(255, 0, 0); // blue
    h.makePalette(pal);
    // console.log(h.pal);
    expect(h.pal.length).toBe(5);
  });

  const black = [0, 0, 0] as const;
  const blue = [255, 0, 0] as const;
  const green = [0, 255, 0] as const;
  const red = [0, 0, 255] as const;
  const white = [255, 255, 255] as const;
  const black1 = [3, 3, 3] as const;
  const srcArr: Array<readonly [number, number, number]> = [
    black,
    blue,
    green,
    red,
    white,
    black1,
  ];
  const rgbRow = new Uint8Array(srcArr.flatMap((e) => e));

  it("cvt with dynamic palette", () => {
    // conversion of rgb to indexed with dynamic palette
    const h = new Histogram();
    srcArr.forEach(([c0, c1, c2]) => h.addColor(c0, c1, c2));
    h.makePaletteN();
    expect(h.pal.length).toBe(5);
    const width = srcArr.length;
    const dstRow = new Uint8Array(width);
    h.cvt(
      width,
      rgbRow.buffer,
      rgbRow.byteOffset,
      dstRow.buffer,
      dstRow.byteOffset
    );
    expect(dumpA(h.pal[dstRow[0]!]!)).toBe("00 00 00 FF");
    expect(dumpA(h.pal[dstRow[1]!]!)).toBe("FF 00 00 FF");
    expect(dumpA(h.pal[dstRow[2]!]!)).toBe("00 FF 00 FF");
    expect(dumpA(h.pal[dstRow[3]!]!)).toBe("00 00 FF FF");
    expect(dumpA(h.pal[dstRow[4]!]!)).toBe("FF FF FF FF");
    expect(dumpA(h.pal[dstRow[5]!]!)).toBe("00 00 00 FF");
  });

  it("cvt with fixed palette", () => {
    const h = new Histogram();
    srcArr.forEach(([c0, c1, c2]) => h.addColor(c0, c1, c2));
    h.makePalette(paletteEGA);
    expect(h.pal.length).toBe(16);
    const width = srcArr.length;
    const dstRow = new Uint8Array(width);
    h.cvt(
      width,
      rgbRow.buffer,
      rgbRow.byteOffset,
      dstRow.buffer,
      dstRow.byteOffset
    );
    expect(dstRow[0]).toBe(iEGA.black);
    expect(dstRow[1]).toBe(iEGA.blue);
    expect(dstRow[2]).toBe(iEGA.green);
    expect(dstRow[3]).toBe(iEGA.red);
    expect(dstRow[4]).toBe(iEGA.white);
    expect(dstRow[5]).toBe(iEGA.black);
  });

  // Тест временно отключен, т.к. есть вопросы (см. по коду в конце теста)
  xit("cvtDither", () => {
    const h = new Histogram();
    const width = 32;
    const row0 = new Uint8Array(width * 3);
    const row1 = new Uint8Array(width * 3);
    // make gradient from [0,0,0] to [0,127,255]
    for (let i = 0; i < width; i++) {
      const hi = (255 * i) / width;
      const med = hi / 2;
      row0[i * 3] = 0;
      row0[i * 3 + 1] = med;
      row0[i * 3 + 2] = hi;
      row1[i * 3] = med;
      row1[i * 3 + 1] = hi;
      row1[i * 3 + 2] = 0;
    }
    // add colors
    for (let i = 0; i < width * 3; i += 3) {
      h.addColor(row0[i]!, row0[i + 1]!, row0[i + 2]!);
      h.addColor(row1[i]!, row1[i + 1]!, row1[i + 2]!);
    }
    const pal: Palette = [
      [0, 0x00, 0x00, 255],
      [0, 0x1f, 0x3f, 255],
      [0, 0x3f, 0x7f, 255],
      [0, 0x5f, 0xbf, 255],
      [0, 0x7f, 0xff, 255],
      [0x1f, 0x3f, 0, 255],
      [0x3f, 0x7f, 0, 255],
      [0x5f, 0xbf, 0, 255],
      [0x7f, 0xff, 0, 255],
    ];
    h.makePalette(pal);
    const evens = new Uint16Array(width + 2);
    const odds = new Uint16Array(width + 2);
    const dst0d = new Uint8Array(width);
    const dst1d = new Uint8Array(width);
    const dst0n = new Uint8Array(width);
    const dst1n = new Uint8Array(width);
    h.cvt(width, row0.buffer, row0.byteOffset, dst0n.buffer, dst0n.byteOffset);
    h.cvt(width, row1.buffer, row1.byteOffset, dst1n.buffer, dst1n.byteOffset);
    h.cvtDither(
      width,
      row0.buffer,
      row0.byteOffset,
      dst0d.buffer,
      dst0d.byteOffset,
      evens,
      odds,
      false
    );
    h.cvtDither(
      width,
      row1.buffer,
      row1.byteOffset,
      dst1d.buffer,
      dst1d.byteOffset,
      evens,
      odds,
      true
    );
    // TODO: Пока не очень ясно, почему 5 нулей и 3 четверки. Логичнее было бы всех по 4.
    expect(dump(dst0n)).toBe(
      "00 00 00 00 00 01 01 01 01 01 01 01 01 02 02 02 02 02 02 02 02 03 03 03 03 03 03 03 03 04 04 04"
    );
    // TODO: здесь тоже
    expect(dump(dst1n)).toBe(
      "00 00 00 00 00 05 05 05 05 05 05 05 05 06 06 06 06 06 06 06 06 07 07 07 07 07 07 07 07 08 08 08"
    );
    // Здесь нужно выяснить, почему примешался 04
    expect(dump(dst0d)).toBe(
      "00 00 00 00 01 04 01 04 07 06 01 01 01 02 02 02 02 02 02 02 02 03 03 03 03 03 03 03 03 04 04 04"
    );
    // А здесь нет размытия между 00 и 05
    expect(dump(dst1d)).toBe(
      "00 00 00 00 00 05 05 05 05 05 05 05 05 06 06 06 06 06 06 06 06 07 04 04 08 08 08 08 08 04 04 04"
    );
  });
});
