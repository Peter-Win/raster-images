import { createInfo } from "../../ImageInfo";
import { Palette } from "../../Palette/Palette";
import { PixelFormat } from "../../PixelFormat";
import { Surface, SurfaceStd } from "../../Surface";
import { ErrorRI } from "../../utils";
import { Converter } from "../Converter";
import { surfaceConverter } from "../surfaceConverter";
import { getTestFile } from "../../tests/getTestFile";
import { dot24, drawSphere } from "../../tests/drawSphere";
import { saveBmpImage } from "../../format/bmp/saveBmp";
import { createFloydSteinberg } from "../dithering/FloydSteinberg";
import { Point } from "../../math/Point";
import { DitherCtx } from "../dithering/DitherCtx";
import { copyBytes } from "../rowOps/copy/copyBytes";
import { paletteEGA } from "../../Palette";
import { OnProgressInfo, ProgressInfo } from "../ProgressInfo";
import { ParamsConverter } from "../converters/ParamsConverter";
import { rowsConverter } from "../converters/rowsConverter";
import { quant2Converter } from "../converters/quant2Converter";
import { paletteReduceConverter } from "../converters/paletteReduceConverter";
import { readImage } from "../readImage";
import { writeImage } from "../writeImage";
import { ConverterFactory, ConverterFactoryDescr } from "../ConverterFactory";
import { pack8to4bits } from "../rowOps/indexed/indexedToIndexedDown";

/* eslint no-param-reassign: "off" */

// Типовые фабрики

// Фабрика для построчного преобразования без дополниткльных параметров
const factorySimpleRows =
  (
    rowCvt: (width: number, src: Uint8Array, dst: Uint8Array) => void
  ): ConverterFactory =>
  (params: ParamsConverter) =>
    rowsConverter({
      ...params,
      makeRowCvt: (width: number) => (src, dst) => rowCvt(width, src, dst),
    });

// Фабрика с применением dithering
const factoryDithering =
  (
    rowCvt: (
      width: number,
      src: Uint8Array,
      dst: Uint8Array,
      ctx: DitherCtx
    ) => void
  ): ConverterFactory =>
  (params: ParamsConverter) => {
    const ctx = createFloydSteinberg(
      params.size.x,
      new PixelFormat(params.dstSign)
    );
    return rowsConverter({
      ...params,
      makeRowCvt: (width: number) => (src, dst) => rowCvt(width, src, dst, ctx),
    });
  };

// Фабрика с использованием палитры
const factoryPalette =
  (
    rowCvt: (
      width: number,
      src: Uint8Array,
      dst: Uint8Array,
      palette: Readonly<Palette>
    ) => void
  ): ConverterFactory =>
  (params: ParamsConverter) =>
    rowsConverter({
      ...params,
      makeRowCvt: (
        width: number,
        srcPixFmt: PixelFormat,
        dstPixFmt: PixelFormat
      ) => {
        const { palette } = srcPixFmt;
        if (!palette)
          throw new ErrorRI("Expected palette to convert from <src> to <dst>", {
            src: srcPixFmt.signature,
            dst: dstPixFmt.signature,
          });
        return (src, dst) => rowCvt(width, src, dst, palette);
      },
    });

const factoryI4toI8: ConverterFactory = (params: ParamsConverter) =>
  rowsConverter({
    ...params,
    makeDstInfo: (srcInfo) => ({
      size: srcInfo.size,
      fmt: new PixelFormat({
        depth: 8,
        colorModel: "Indexed",
        palette: srcInfo.fmt.palette,
      }),
    }),
    makeRowCvt: (width) => (srcRow, dstRow) => {
      let x = 0;
      while (x < width) {
        const packed = srcRow[x >> 1]!;
        dstRow[x++] = (x & 1) === 0 ? packed >> 4 : packed & 0xf;
      }
    },
  });

const cvtSwap24 = (width: number, src: Uint8Array, dst: Uint8Array) => {
  let srcPos = 0;
  let dstPos = 0;
  const end = width * 3;
  while (srcPos < end) {
    const c0 = src[srcPos++]!;
    const c1 = src[srcPos++]!;
    const c2 = src[srcPos++]!;
    dst[dstPos++] = c2;
    dst[dstPos++] = c1;
    dst[dstPos++] = c0;
  }
};

const cvt24to15Dither = (
  width: number,
  src: Uint8Array,
  dst: Uint8Array,
  ctx: DitherCtx
) => {
  const wdst = new Uint16Array(dst.buffer, dst.byteOffset);
  ctx.startLine();
  for (let i = 0; i < width; i++) {
    const x = ctx.getX();
    const srcPos = x * 3;
    const n0 = ctx.getNew(0, src[srcPos]!);
    const n1 = ctx.getNew(1, src[srcPos + 1]!);
    const n2 = ctx.getNew(2, src[srcPos + 2]!);
    const d0 = n0 >> 3;
    const d1 = n1 >> 3;
    const d2 = n2 >> 3;
    const r0 = (d0 << 3) | (d0 >> 2);
    const r1 = (d1 << 3) | (d1 >> 2);
    const r2 = (d2 << 3) | (d2 >> 2);
    ctx.setError(0, n0 - r0);
    ctx.setError(1, n1 - r1);
    ctx.setError(2, n2 - r2);
    wdst[x] = d0 | (d1 << 5) | (d2 << 10);
    ctx.nextPixel();
  }
};

const cvtI8toBGR = (
  width: number,
  src: Uint8Array,
  dst: Uint8Array,
  palette: Readonly<Palette>
) => {
  let srcPos = 0;
  let dstPos = 0;
  while (srcPos < width) {
    const [b, g, r] = palette[src[srcPos++]!]!;
    dst[dstPos++] = b;
    dst[dstPos++] = g;
    dst[dstPos++] = r;
  }
};

const allConverters: ConverterFactoryDescr[] = [
  {
    srcSign: "R8G8B8",
    dstSign: "B8G8R8",
    props: { loss: false, speed: 100, quality: 100 },
    create: factorySimpleRows(cvtSwap24),
  },
  {
    srcSign: "B8G8R8",
    dstSign: "R8G8B8",
    props: { loss: false, speed: 100, quality: 100 },
    create: factorySimpleRows(cvtSwap24),
  },
  {
    srcSign: "B8G8R8",
    dstSign: "B5G5R5",
    props: { loss: true, dithering: true, speed: 80, quality: 90 },
    create: factoryDithering(cvt24to15Dither),
  },
  {
    srcSign: "B8G8R8",
    dstSign: "I8",
    props: { loss: true, dithering: true, speed: 50, quality: 80 },
    create: (params) => quant2Converter({ ...params, dithering: true }),
  },
  {
    srcSign: "I8",
    dstSign: "B8G8R8",
    props: { loss: false, speed: 100, quality: 100 },
    create: factoryPalette(cvtI8toBGR),
  },
  {
    srcSign: "I4",
    dstSign: "I8",
    props: { loss: false, speed: 100, quality: 100 },
    create: factoryI4toI8,
  },
  {
    srcSign: "I8",
    dstSign: "I4",
    props: { loss: true, dithering: true, speed: 80, quality: 80 },
    create: (params) =>
      paletteReduceConverter({
        ...params,
        rowOp: pack8to4bits,
        dithering: true,
      }),
  },
];

type OptionsFindConverterDescr = {
  prior?: "speed" | "quality";
  noDithering?: boolean;
  progress?: OnProgressInfo;
};

const findConverterDescr = (
  srcSign: string,
  dstSign: string,
  options?: OptionsFindConverterDescr
): ConverterFactoryDescr => {
  let best: ConverterFactoryDescr | undefined;
  const { prior = "quality", noDithering } = options || {};
  allConverters.forEach((descr) => {
    if (srcSign === descr.srcSign && dstSign === descr.dstSign) {
      if (!noDithering || !descr.props.dithering) {
        if (!best || best.props[prior] < descr.props[prior]) {
          best = descr;
        }
      }
    }
  });
  if (!best) {
    throw new ErrorRI("Converter from <srcSign> to <dstSign> not found", {
      srcSign,
      dstSign,
    });
  }
  return best;
};

const createConverter = (
  nextConverter: Converter,
  size: Point,
  srcSign: string,
  dstSign: string,
  options?: OptionsFindConverterDescr
): Converter => {
  const descr = findConverterDescr(srcSign, dstSign, options);
  return descr.create({
    nextConverter,
    size,
    srcSign,
    dstSign,
    progress: options?.progress,
  });
};

const builderIndexed = () => {
  const cols = 16;
  const rows = 4;
  const qw = 40;
  const qh = 30;
  const width = cols * qw;
  const height = rows * qh;
  const palette: Palette = [];
  for (let i = 0; i < cols; i++) {
    const h = Math.round((i * 255) / (cols - 1));
    palette[i] = [h, h, h, 255];
    palette[i + cols] = [0, 0, h, 255];
    palette[i + cols * 2] = [0, h, 0, 255];
    palette[i + cols * 3] = [h, 0, 0, 255];
  }
  const makePixel = (x: number, y: number): number =>
    Math.floor(y / qh) * cols + Math.floor(x / qw);

  return {
    makePixel,
    info: createInfo(width, height, 8, "Indexed", false, palette),
  };
};

const builtTestImageI8 = (): Surface => {
  const { makePixel, info } = builderIndexed();
  const img = new SurfaceStd(info);
  const { width, height } = img;
  for (let y = 0; y < height; y++) {
    const row = img.getRowBuffer(y);
    for (let x = 0; x < width; x++) row[x] = makePixel(x, y);
  }
  return img;
};

const builderB8G8R8 = () => {
  const width = 400;
  const height = 300;
  const img = SurfaceStd.create(width, height, 24);
  for (let y = 0; y < height; y++) {
    const row = img.getRowBuffer(y);
    const h = (64 * y) / height;
    row.fill(h);
  }
  drawSphere({
    cx: width * 0.4,
    cy: height * 0.48,
    r: height * 0.44,
    ka: 10,
    ks: 20,
    n: 4,
    surface: img,
    dot: dot24([0, 0.6, 0.9]),
  });
  drawSphere({
    cx: width * 0.8,
    cy: height * 0.7,
    r: height * 0.25,
    ka: 0,
    ks: 30,
    n: 5,
    surface: img,
    dot: dot24([0, 0, 1]),
  });
  const makePixel = (x: number, y: number) => {
    const row = img.getRowBuffer(y);
    const pos = x * 3;
    return [row[pos]!, row[pos + 1]!, row[pos + 2]!];
  };
  return { width, height, makePixel, img };
};

describe("Converter", () => {
  it("read I8 to B8G8R8", async () => {
    const progressLog: ProgressInfo[] = [];
    const progress: OnProgressInfo = async (info) => {
      progressLog.push(info);
    };
    const { info, makePixel } = builderIndexed();
    const width = info.size.x;
    const height = info.size.y;
    const dstSurface = SurfaceStd.create(width, height, 24);
    const cvt2 = surfaceConverter(dstSurface);
    const cvt1 = createConverter(cvt2, info.size, "I8", "B8G8R8", { progress });

    await readImage(cvt1, info, async (row: Uint8Array, y: number) => {
      for (let x = 0; x < width; x++) row[x] = makePixel(x, y);
    });

    expect(dstSurface.getRowBuffer(0)[3 * width - 1]).toBe(255);
    const stream = await getTestFile(__dirname, "read-i8-rgb-dst.bmp", "w");
    await saveBmpImage(dstSurface, stream);

    expect(progressLog.length).toBe(height + 2);
    expect(
      Array.from(
        progressLog.reduce((acc, rec) => {
          acc.add(rec.step);
          return acc;
        }, new Set<string>())
      )
    ).toEqual(["read"]);
    expect(progressLog.at(-1)?.value).toBe(height);
  });

  it("read B8G8R8 to I8", async () => {
    const { width, height, makePixel, img } = builderB8G8R8();
    const stream0 = await getTestFile(__dirname, "read-rgb-i8-src.bmp", "w");
    await saveBmpImage(img, stream0);

    const dstSurface = SurfaceStd.create(width, height, 8, {
      colorModel: "Indexed",
    });
    expect(dstSurface.info.fmt.palette).toBeUndefined();
    const cvt2 = surfaceConverter(dstSurface);
    const cvt1 = quant2Converter({
      nextConverter: cvt2,
      size: new Point(width, height),
      srcSign: "B8G8R8",
      dstSign: "I8",
      dithering: true,
    });
    await readImage(cvt1, img.info, async (row, y) => {
      let i = 0;
      for (let x = 0; x < width; x++) {
        const [b, g, r] = makePixel(x, y);
        row[i++] = b!;
        row[i++] = g!;
        row[i++] = r!;
      }
    });
    expect(dstSurface.info.fmt.palette).toBeDefined();
    const stream = await getTestFile(__dirname, "read-rgb-i8-dst.bmp", "w");
    await saveBmpImage(dstSurface, stream);
  });

  it("write B8G8R8 to B5G5R5", async () => {
    const progressLog: ProgressInfo[] = [];
    const progress: OnProgressInfo = async (info) => {
      progressLog.push(info);
    };
    const { width, height, img } = builderB8G8R8();
    const cvt2 = surfaceConverter(img);
    const cvt1 = createConverter(cvt2, img.size, "B8G8R8", "B5G5R5");

    const dstImg = SurfaceStd.create(width, height, 15);

    const reader = await cvt1.getRowsReader();
    await writeImage(
      reader,
      async (srcRow, y) => {
        const dstRow = dstImg.getRowBuffer(y);
        for (let x = 0; x < width * 2; x++) dstRow[x] = srcRow[x]!;
      },
      { progress }
    );

    const stream = await getTestFile(__dirname, "write-24-15-dst.bmp", "w");
    await saveBmpImage(dstImg, stream);

    expect(progressLog.length).toBe(height + 2);
    expect(
      Array.from(
        progressLog.reduce((acc, rec) => {
          acc.add(rec.step);
          return acc;
        }, new Set<string>())
      )
    ).toEqual(["write"]);
    expect(progressLog.at(-1)?.value).toBe(height);
    expect(progressLog[0]?.init).toBe(true);
  });

  // Здесь стыкуются два построчных преобразования I8 -> B8G8R8 -> B5G5R5
  // Одно использует палитру, другое - контекст сглаживания
  it("write I8 to B5G5R5", async () => {
    const srcSurface = builtTestImageI8();
    const { size, width } = srcSurface;
    const cvt3 = surfaceConverter(srcSurface); // srcSurface is I8+palette
    const cvt2 = createConverter(cvt3, size, "I8", "B8G8R8");
    const cvt1 = createConverter(cvt2, size, "B8G8R8", "B5G5R5", {
      prior: "quality",
    });
    const reader = await cvt1.getRowsReader();
    // здесь dstSurface используется, как приёмник. Но вообще запись может выполняться и без поверхности.
    const dstSurface = SurfaceStd.createSize(size, 15);
    await writeImage(reader, async (row: Uint8Array, y: number) => {
      copyBytes(width * 2, row, 0, dstSurface.getRowBuffer(y), 0);
    });

    const row0 = dstSurface.getRowBuffer(0);
    const wrow0 = new Uint16Array(row0.buffer, row0.byteOffset, width);
    const stream = await getTestFile(__dirname, "write-i8-15-dst.bmp", "w");
    await saveBmpImage(dstSurface, stream);
    expect(wrow0[width - 1]).toBe(0x7fff);
  });

  // Using 2-step converter
  // Двухпроходный конвертер для получения изображения с палитрой.
  // Для него используется getSurface. Так как двухпроходный конвертер стыкуется с SurfaceConverter,
  // то getSurface просто возвращает исходное изображение
  it("write B8G8R8 to I8", async () => {
    const progressLog: ProgressInfo[] = [];
    const progress: OnProgressInfo = async (info) => {
      progressLog.push(info);
    };
    const { width, height, img } = builderB8G8R8();
    const cvt2 = surfaceConverter(img);
    const cvt1 = quant2Converter({
      nextConverter: cvt2,
      size: img.size,
      srcSign: "B8G8R8",
      dstSign: "I8",
      dithering: true,
      progress,
    });

    const reader = await cvt1.getRowsReader();
    const dstImg = new SurfaceStd(reader.dstInfo);
    expect(reader.dstInfo.fmt.palette).toBeDefined();
    await writeImage(
      reader,
      async (srcRow, y) => {
        const dstRow = dstImg.getRowBuffer(y);
        for (let x = 0; x < width * 2; x++) dstRow[x] = srcRow[x]!;
      },
      { progress }
    );

    const stream = await getTestFile(__dirname, "write-bgr-i8-dst.bmp", "w");
    await saveBmpImage(dstImg, stream);

    expect(progressLog.length).toBe(height + 2);
    expect(
      Array.from(
        progressLog.reduce((acc, rec) => {
          acc.add(rec.step);
          return acc;
        }, new Set<string>())
      )
    ).toEqual(["write"]);
    expect(progressLog.at(-1)?.value).toBe(height);
    expect(progressLog[0]?.init).toBe(true);
  });

  // Снова двухпроходный алгоритм, но теперь он стыкуется с построчным конвертером.
  // Поэтому будет построено промежуточное изображение BGR из исходного RGB
  it("write R8G8B8 to I8", async () => {
    // Та же функция, что и для BGR. Но поменяются местами цветовые компоненты.
    const { width, img } = builderB8G8R8();
    const cvt3 = surfaceConverter(img);
    const cvt2 = createConverter(cvt3, img.size, "R8G8B8", "B8G8R8");
    const cvt1 = quant2Converter({
      nextConverter: cvt2,
      size: img.size,
      srcSign: "B8G8R8",
      dstSign: "I8",
    });

    const reader = await cvt1.getRowsReader();
    const { dstInfo } = reader;
    const dstImg = new SurfaceStd(dstInfo);
    expect(dstImg.palette).toBeDefined();
    await writeImage(reader, async (srcRow, y) => {
      const dstRow = dstImg.getRowBuffer(y);
      for (let x = 0; x < width * 2; x++) dstRow[x] = srcRow[x]!;
    });

    // Большая сфера получится голубая, а маленькая - синяя.
    const stream = await getTestFile(__dirname, "write-rgb-i8-dst.bmp", "w");
    await saveBmpImage(dstImg, stream);
  });

  // Особый случай, где один конвертер берет палитру из другого
  // I4 -> I8 -> B8G8R8
  it("write I4 to B8G8R8", async () => {
    const cellWidth = 40;
    const cellHeight = 30;
    const width = 4 * cellWidth;
    const height = 4 * cellHeight;
    const srcImg = SurfaceStd.create(width, height, 4, {
      colorModel: "Indexed",
      palette: paletteEGA,
    });
    const { size } = srcImg;
    for (let y = 0; y < height; y++) {
      const row = srcImg.getRowBuffer(y);
      for (let x = 0; x < width; x++) {
        const i = Math.floor(y / cellHeight) * 4 + Math.floor(x / cellWidth);
        row[x >> 1] |= (x & 1) === 0 ? i << 4 : i;
      }
    }
    expect(srcImg.getRowBuffer(0)[width / 2 - 1]).toBe(0x33);
    expect(srcImg.getRowBuffer(height - 1)[width / 2 - 1]).toBe(0xff);
    const cvt3 = surfaceConverter(srcImg);
    const cvt2 = createConverter(cvt3, size, "I4", "I8");
    const cvt1 = createConverter(cvt2, size, "I8", "B8G8R8");
    const reader = await cvt1.getRowsReader();
    const dstImg = SurfaceStd.create(width, height, 24);
    await writeImage(reader, async (srcRow, y) => {
      copyBytes(width * 3, srcRow, 0, dstImg.getRowBuffer(y), 0);
    });
    const stream = await getTestFile(__dirname, "write-i4-bgr-dst.bmp", "w");
    await saveBmpImage(dstImg, stream);
  });

  // А здесь промежуточный конвертер B8G8R8->I8 производит квантизацию,
  // но количество цветов он берет из следующего конвертера I8-I4.
  // Это позволяет сразу получить 16 цветовую палитру
  it("write B8G8R8 to I4", async () => {
    const { width, img } = builderB8G8R8();
    const cvt3 = surfaceConverter(img);
    const cvt2 = createConverter(cvt3, img.size, "B8G8R8", "I8");
    const cvt1 = createConverter(cvt2, img.size, "I8", "I4");
    const reader = await cvt1.getRowsReader();
    const dstImg = new SurfaceStd(reader.dstInfo);
    await writeImage(reader, async (srcRow, y) => {
      copyBytes(width / 2, srcRow, 0, dstImg.getRowBuffer(y), 0);
    });
    const stream = await getTestFile(__dirname, "write-bgr-i4-dst.bmp", "w");
    await saveBmpImage(dstImg, stream);
  });
});
