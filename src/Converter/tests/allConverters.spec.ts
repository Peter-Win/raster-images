import { ImageInfo } from "../../ImageInfo";
import { createGrayPalette, paletteEGA } from "../../Palette";
import { PixelFormat } from "../../PixelFormat";
import { SurfaceStd } from "../../Surface";
import { Point } from "../../math/Point";
import { dump, dumpA, dumpW } from "../../utils";
import { ConverterFactoryDescr } from "../ConverterFactory";
import { allConverters } from "../allConverters";
import { ConverterSearchProps } from "../search/ConverterSearchProps";
import { surfaceConverter } from "../surfaceConverter";

const isAppDither = (
  descr: ConverterFactoryDescr,
  searchDither: boolean
): boolean => !(descr.props.dithering === true && searchDither === false);

const findBest = (
  list: ConverterFactoryDescr[],
  srcSign: string,
  dstSign: string,
  { dithering, prefer }: ConverterSearchProps
): ConverterFactoryDescr | undefined => {
  let res: ConverterFactoryDescr | undefined;
  list.forEach((descr) => {
    if (
      descr.srcSign === srcSign &&
      descr.dstSign === dstSign &&
      isAppDither(descr, dithering)
    ) {
      if (!res || descr.props[prefer] > res.props[prefer]) {
        res = descr;
      }
    }
  });
  return res;
};

type Result = {
  row: Uint8Array;
  dstInfo: ImageInfo;
};

const cvt = async (
  srcDef: string | PixelFormat,
  dstSign: string,
  searchProps: Partial<ConverterSearchProps>,
  data: number[],
  width = 1
): Promise<Result> => {
  const srcPixFmt =
    typeof srcDef === "string" ? new PixelFormat(srcDef) : srcDef;
  const srcSign = srcPixFmt.signature;
  const props: ConverterSearchProps = {
    dithering: searchProps.dithering ?? true,
    prefer: searchProps.prefer ?? "quality",
  };
  const descr = findBest(allConverters, srcSign, dstSign, props);
  if (!descr) {
    let dith = "";
    if (typeof searchProps.dithering === "boolean")
      dith = searchProps.dithering ? " dither" : " noDither";
    throw new Error(`Not found converter ${srcSign} => ${dstSign}${dith}`);
  }
  const size = new Point(width, 1);
  const srcInfo: ImageInfo = { size, fmt: srcPixFmt };
  const srcImg = new SurfaceStd(srcInfo, new Uint8Array(data));
  const nextConverter = surfaceConverter(srcImg);
  const converter = descr.create({
    nextConverter,
    srcSign,
    dstSign,
    size,
  });
  const reader = await converter.getRowsReader();
  const row = await reader.readRow(0);
  return { row, dstInfo: reader.dstInfo };
};

const wdata = (data: number[]): number[] => {
  const wbuf = new Uint16Array(data);
  const bbuf = new Uint8Array(wbuf.buffer, wbuf.byteOffset, wbuf.byteLength);
  return Array.from(bbuf);
};

const fdata = (data: number[]): number[] => {
  const fbuf = new Float32Array(data);
  const bbuf = new Uint8Array(fbuf.buffer, fbuf.byteOffset, fbuf.byteLength);
  return Array.from(bbuf);
};

const f64data = (data: number[]): number[] => {
  const fbuf = new Float64Array(data);
  const bbuf = new Uint8Array(fbuf.buffer, fbuf.byteOffset, fbuf.byteLength);
  return Array.from(bbuf);
};

const mk = async (
  srcDef: string | PixelFormat,
  dstSign: string,
  searchProps: Partial<ConverterSearchProps>,
  data: number[],
  width = 1
): Promise<string> => {
  const { row } = await cvt(srcDef, dstSign, searchProps, data, width);
  return dump(row);
};

const mkw = async (
  srcDef: string | PixelFormat,
  dstSign: string,
  searchProps: Partial<ConverterSearchProps>,
  data: number[],
  width = 1
): Promise<string> => {
  const { row } = await cvt(srcDef, dstSign, searchProps, data, width);
  return dumpW(new Uint16Array(row.buffer, row.byteOffset));
};

const mkf = async (
  srcDef: string | PixelFormat,
  dstSign: string,
  searchProps: Partial<ConverterSearchProps>,
  data: number[],
  width = 1,
  precision = 2
): Promise<string> => {
  const { row } = await cvt(srcDef, dstSign, searchProps, data, width);
  return Array.from(new Float32Array(row.buffer, row.byteOffset))
    .map((n) => n.toFixed(precision))
    .join(" ");
};

// const mkf64 = async (
//   srcDef: string | PixelFormat,
//   dstSign: string,
//   searchProps: Partial<ConverterSearchProps>,
//   data: number[],
//   width = 1,
//   precision = 2
// ): Promise<string> => {
//   const { row } = await cvt(srcDef, dstSign, searchProps, data, width);
//   return Array.from(new Float64Array(row.buffer, row.byteOffset))
//     .map((n) => n.toFixed(precision))
//     .join(" ");
// };

test("allConverters", async () => {
  // ----- RGB -------
  // RGB 15
  const rgb15 = wdata([0, 0x7fff]);
  expect(await mk("B5G5R5", "B8G8R8", {}, rgb15, 2)).toBe("00 00 00 FF FF FF");
  expect(await mk("B5G5R5", "B8G8R8", { prefer: "speed" }, rgb15, 2)).toBe(
    "00 00 00 F8 F8 F8"
  );
  expect(await mk("B5G5R5", "B8G8R8A8", {}, rgb15, 2)).toBe(
    "00 00 00 FF FF FF FF FF"
  );
  // RGB 16
  const rgb16 = wdata([0, 0xffff]);
  expect(await mk("B5G6R5", "B8G8R8", {}, rgb16, 2)).toBe("00 00 00 FF FF FF");
  expect(await mk("B5G6R5", "B8G8R8", { prefer: "speed" }, rgb16, 2)).toBe(
    "00 00 00 F8 FC F8"
  );
  expect(await mk("B5G6R5", "B8G8R8A8", {}, rgb16, 2)).toBe(
    "00 00 00 FF FF FF FF FF"
  );

  // RGB 24
  expect(await mkw("B8G8R8", "B5G5R5", {}, [0, 0, 0, 255, 255, 255], 2)).toBe(
    "0000 7FFF"
  );
  expect(await mk("B8G8R8", "R8G8B8", {}, [1, 2, 3, 4, 5, 6], 2)).toBe(
    "03 02 01 06 05 04"
  );
  expect(await mk("R8G8B8", "B8G8R8", {}, [1, 2, 3, 4, 5, 6], 2)).toBe(
    "03 02 01 06 05 04"
  );
  expect(await mk("B8G8R8", "B8G8R8A8", {}, [0xfe, 0xaa, 0x12])).toBe(
    "FE AA 12 FF"
  );
  const rgb1to6 = [1, 2, 3, 4, 5, 6];
  expect(await mk("R8G8B8", "R8G8B8A8", {}, [1, 2, 3])).toBe("01 02 03 FF");
  expect(await mk("B8G8R8", "R8G8B8A8", {}, rgb1to6, 2)).toBe(
    "03 02 01 FF 06 05 04 FF"
  );
  expect(await mk("B8G8R8", "R8G8B8A8", {}, [1, 2, 3, 4, 5, 6], 2)).toBe(
    "03 02 01 FF 06 05 04 FF"
  );
  const rgb = [255, 0, 0, 0, 255, 0, 0, 0, 255];
  expect(await mk("B8G8R8", "G8", {}, rgb, 3)).toBe("12 B6 36");
  expect(await mk("R8G8B8", "G8", {}, rgb, 3)).toBe("36 B6 12");

  // rgb 32
  const rgb1to8 = [1, 2, 3, 4, 5, 6, 7, 8];
  expect(await mk("B8G8R8A8", "R8G8B8A8", {}, rgb1to8, 2)).toBe(
    "03 02 01 04 07 06 05 08"
  );
  expect(await mk("R8G8B8A8", "B8G8R8A8", {}, rgb1to8, 2)).toBe(
    "03 02 01 04 07 06 05 08"
  );

  // rgb 48
  const rgb48 = [0, 0xff, 0xfff, 0x1000, 0x1234, 0xffff];
  expect(await mk("B16G16R16", "B8G8R8", {}, wdata(rgb48), 2)).toBe(
    "00 00 0F 10 12 FF"
  );
  expect(await mk("R16G16B16", "R8G8B8", {}, wdata(rgb48), 2)).toBe(
    "00 00 0F 10 12 FF"
  );

  // rgb 64
  const rgb64 = [0, 0xff, 0xfff, 0x8765, 0x1000, 0x1234, 0xffff, 0xaa55];
  expect(await mk("B16G16R16A16", "B8G8R8A8", {}, wdata(rgb64), 2)).toBe(
    "00 00 0F 87 10 12 FF AA"
  );
  expect(await mk("R16G16B16A16", "R8G8B8A8", {}, wdata(rgb64), 2)).toBe(
    "00 00 0F 87 10 12 FF AA"
  );
  // rgb 3*32
  expect(await mkw("R32G32B32", "R16G16B16", {}, fdata([0, 0.5, 1]))).toBe(
    "0000 7FFF FFFF"
  );
  expect(await mkw("B32G32R32", "B16G16R16", {}, fdata([0, 0.5, 1]))).toBe(
    "0000 7FFF FFFF"
  );
  expect(await mkf("R32G32B32", "B32G32R32", {}, fdata([0, 0.5, 1]))).toBe(
    "1.00 0.50 0.00"
  );
  expect(await mkf("B32G32R32", "R32G32B32", {}, fdata([0, 0.5, 1]))).toBe(
    "1.00 0.50 0.00"
  );
  // rgb 4*32
  expect(
    await mkw("B32G32R32A32", "B16G16R16A16", {}, fdata([0, 0.25, 0.5, 1]))
  ).toBe("0000 3FFF 7FFF FFFF");
  expect(
    await mkw("R32G32B32A32", "R16G16B16A16", {}, fdata([0, 0.25, 0.5, 1]))
  ).toBe("0000 3FFF 7FFF FFFF");
  // rgb 3*64
  expect(await mkf("R64G64B64", "R32G32B32", {}, f64data([0, 0.5, 1]))).toBe(
    "0.00 0.50 1.00"
  );

  // rgb -> palette
  const resPal1 = await cvt("B8G8R8", "I8", {}, rgb, 3);
  expect(
    Array.from(resPal1.row)
      .map((i) => dumpA(resPal1.dstInfo.fmt.palette?.[i] || []))
      .join(", ")
  ).toBe("FF 00 00 FF, 00 FF 00 FF, 00 00 FF FF");

  // ----- Gray-------
  // Gray 1
  expect(await mk("G1", "G8", {}, [0xca, 0x80], 9)).toBe(
    "FF FF 00 00 FF 00 FF 00 FF"
  );
  expect(await mk("G1", "B8G8R8", {}, [0xa0], 4)).toBe(
    "FF FF FF 00 00 00 FF FF FF 00 00 00"
  );
  expect(await mk("G1", "B8G8R8", {}, [0xa0], 4)).toBe(
    "FF FF FF 00 00 00 FF FF FF 00 00 00"
  );
  expect(await mk("G1", "B8G8R8A8", {}, [0xa0], 4)).toBe(
    "FF FF FF FF 00 00 00 FF FF FF FF FF 00 00 00 FF"
  );
  expect(await mk("G1", "B8G8R8A8", {}, [0xa0], 4)).toBe(
    "FF FF FF FF 00 00 00 FF FF FF FF FF 00 00 00 FF"
  );
  // Gray 8
  const g8 = [0, 0, 0, 0, 255, 255, 255, 255, 128, 128, 128, 128];
  expect(await mk("G8", "G1", {}, g8, g8.length)).toBe("0F A0");
  expect(await mk("G8", "G1", { prefer: "speed" }, g8, g8.length)).toBe(
    "0F F0"
  );
  expect(await mk("G8", "B8G8R8", {}, [0, 0x1e, 0xab], 3)).toBe(
    "00 00 00 1E 1E 1E AB AB AB"
  );
  expect(await mk("G8", "R8G8B8", {}, [1, 2], 2)).toBe("01 01 01 02 02 02");
  expect(await mk("G8", "B8G8R8A8", {}, [0x3a])).toBe("3A 3A 3A FF");
  expect(await mk("G8", "R8G8B8A8", {}, [0x3a])).toBe("3A 3A 3A FF");

  // Gray8 + Alpha
  expect(await mk("G8A8", "R8G8B8A8", {}, [1, 2])).toBe("01 01 01 02");
  expect(await mk("G8A8", "B8G8R8A8", {}, [1, 2])).toBe("01 01 01 02");

  // Gray 16
  expect(
    await mk("G16", "G8", {}, wdata([0, 0xff, 0x1ff, 0x1fff, 0xfffff]), 5)
  ).toBe("00 00 01 1F FF");
  expect(
    await mk("G16A16", "G8A8", {}, wdata([0, 0xff, 0x1ff, 0x1fff]), 2)
  ).toBe("00 00 01 1F");

  // Gray 32
  expect(await mk("G32", "G8", {}, fdata([0, 0.5, 1]), 3)).toBe("00 7F FF");
  expect(await mkw("G32", "G16", {}, fdata([0, 0.5, 1]), 3)).toBe(
    "0000 7FFF FFFF"
  );
  // Gray32 + Alpga
  expect(await mkw("G32A32", "G16A16", {}, fdata([0.5, 1]))).toBe("7FFF FFFF");

  // -----------
  // Indexed
  // -----------
  const fmtI8ega = new PixelFormat({
    depth: 8,
    colorModel: "Indexed",
    palette: paletteEGA,
  });
  expect(await mk(fmtI8ega, "B8G8R8", {}, [0, 1, 14], 3)).toBe(
    "00 00 00 AA 00 00 55 FF FF"
  );
  expect(await mk(fmtI8ega, "R8G8B8", {}, [0, 1, 14], 3)).toBe(
    "00 00 00 00 00 AA FF FF 55"
  );
  expect(await mk(fmtI8ega, "B8G8R8A8", {}, [0, 1, 14], 3)).toBe(
    "00 00 00 FF AA 00 00 FF 55 FF FF FF"
  );
  expect(await mk(fmtI8ega, "R8G8B8A8", {}, [0, 1, 14], 3)).toBe(
    "00 00 00 FF 00 00 AA FF FF FF 55 FF"
  );
  // index up
  const fmtI1 = new PixelFormat({
    depth: 1,
    colorModel: "Indexed",
    palette: createGrayPalette(2),
  });
  const resI1to8 = await cvt(fmtI1, "I8", {}, [0xac], 7);
  expect(dump(resI1to8.row)).toBe("01 00 01 00 01 01 00");
  expect(resI1to8.dstInfo.fmt.palette).toEqual(fmtI1.palette);

  const fmtI4 = new PixelFormat({
    depth: 4,
    colorModel: "Indexed",
    palette: paletteEGA,
  });
  const resI4to8 = await cvt(fmtI4, "I8", {}, [0x54, 0xac], 4);
  expect(dump(resI4to8.row)).toBe("05 04 0A 0C");
  expect(resI4to8.dstInfo.fmt.palette).toEqual(paletteEGA);

  // index down
  const resI8toI4 = await cvt(fmtI8ega, "I4", {}, [0, 15, 2, 10], 4);
  expect(dump(resI8toI4.row)).toBe("0F 2A");
  expect(resI8toI4.dstInfo.fmt.palette).toEqual(paletteEGA);

  const fmtI8bw = new PixelFormat({
    depth: 8,
    colorModel: "Indexed",
    palette: createGrayPalette(2),
  });
  const resI8toI1 = await cvt(
    fmtI8bw,
    "I1",
    {},
    [0, 0, 1, 0, 0, 1, 0, 0, 1],
    9
  );
  expect(dump(resI8toI1.row)).toBe("24 80");
  expect(dumpA(resI8toI1.dstInfo.fmt.palette?.flatMap((n) => n) || [])).toBe(
    "00 00 00 FF FF FF FF FF"
  );

  // -----------
  // CMYK
  // cmyk8
  expect(
    await mkw("C8M8Y8K8", "C16M16Y16K16", {}, [0x12, 0x34, 0x56, 0x78])
  ).toBe("1212 3434 5656 7878");
  expect(
    await mkw(
      "C8M8Y8K8A8",
      "C16M16Y16K16A16",
      {},
      [0x12, 0x34, 0x56, 0x78, 0x90]
    )
  ).toBe("1212 3434 5656 7878 9090");
  // cmyk16 red(0,1,1,0)
  expect(
    await mkw("C16M16Y16K16", "R16G16B16", {}, wdata([0, 0xffff, 0xffff, 0]))
  ).toBe("FFFF 0000 0000");
  expect(
    await mkw(
      "C16M16Y16K16A16",
      "R16G16B16A16",
      {},
      wdata([0, 0xffff, 0xffff, 0, 0x123])
    )
  ).toBe("FFFF 0000 0000 0123");
  // cmyk32
  expect(
    await mkw("C32M32Y32K32", "C16M16Y16K16", {}, fdata([0, 0.25, 0.5, 1]))
  ).toBe("0000 3FFF 7FFF FFFF");
  expect(
    await mkw(
      "C32M32Y32K32A32",
      "C16M16Y16K16A16",
      {},
      fdata([0, 0.25, 0.5, 0.75, 1])
    )
  ).toBe("0000 3FFF 7FFF BFFF FFFF");
});
