import { dump } from "../../../utils";
import { createFloydSteinberg8 } from "../../dithering/FloydSteinberg";
import { CvtGray8to1Dither, CvtGray8to1Fast } from "../CvtGray8to1";
import { Surface, SurfaceStd } from "../../../Surface";
import { drawSphere, dotG8 } from "../../../tests/drawSphere";
import { getTestFile } from "../../../tests/getTestFile";
import { formatForSaveFromSurface } from "../../../format/FormatForSave";
import { savePnm } from "../../../format/pnm/savePnm";

test("CvtGray8to1Fast", () => {
  // ignore 3 first and 2 last bytes, use 10 pixels
  // 127 > 0, 128 > 1, 100 > 0, 200 > 1, 0, 0, 255>1, 255>1, 33 > 0, 222 > 1
  // 0101001101 = 0x53, 0x40
  const src = new Uint8Array([
    255, 255, 255, 127, 128, 100, 200, 0, 0, 255, 255, 33, 222, 255, 255,
  ]);
  // 10 pixels >> 2 bytes, plus 1 byte before and 1 byte after = 4 bytes
  const dst = new Uint8Array(4);
  CvtGray8to1Fast.cvt(
    10,
    src.buffer,
    src.byteOffset + 3,
    dst.buffer,
    dst.byteOffset + 1
  );
  expect(dump(dst)).toBe("00 53 40 00");

  // The number of pixels is a multiple of 8.
  // 0 1 0 1  1 0 1 1  1 0 1 0  1 1 1 1
  const src1 = new Uint8Array([
    0, 255, 0, 255, 200, 20, 200, 200, 190, 60, 190, 60, 255, 245, 235, 225,
  ]);
  const dst1 = new Uint8Array(6);
  CvtGray8to1Fast.cvt(
    16,
    src1.buffer,
    src1.byteOffset,
    dst1.buffer,
    dst1.byteOffset + 2
  );
  expect(dump(dst1)).toBe("00 00 5B AF 00 00");
});

describe("CvtGray8to1Dither", () => {
  it("not aligned", () => {
    const width = 27;
    const src0 = new Uint8Array(width);
    src0.fill(64);
    const src1 = new Uint8Array(width);
    src1.fill(64);
    const dstBytes = ((width + 7) >> 3) + 2;
    const dst0 = new Uint8Array(dstBytes);
    dst0.fill(0xff);
    const dst1 = new Uint8Array(dstBytes);
    const ctx = createFloydSteinberg8(width, 1);
    CvtGray8to1Dither.cvt(
      width,
      src0.buffer,
      src0.byteOffset,
      dst0.buffer,
      dst0.byteOffset + 1,
      ctx
    );
    CvtGray8to1Dither.cvt(
      width,
      src1.buffer,
      src1.byteOffset,
      dst1.buffer,
      dst1.byteOffset + 1,
      ctx
    );
    // Самая первая линия выглядит не так как остальные. Потому что на нее влияет только одна ошибка 7/16
    //  prev  current  7/16
    //  1/16   5/16    3/16
    // то есть, больше половины идёт в следующую строку
    // Например, если первая строка заполнена 64, то ошибка 7/16 доходит только до 49
    // (64+49)*7/16 = 49.
    // А так как 64+49=113 < 128, то результат преобразования всегда даёт черную строку
    expect(dump(dst0)).toBe("FF 00 00 00 1F FF");
    // А следующая строка при тех же исходных данных заполнена уже практически равномерно.
    expect(dump(dst1)).toBe("00 55 55 55 40 00");
  });
});

test("CvtGray8to1", async () => {
  // Сравнительный результат методов преобразования из G8 -> G1
  const width = 400;
  const height = 300;
  const srcImg = SurfaceStd.create(width, height, 8, { colorModel: "Gray" });
  srcImg.fill(15);
  drawSphere({
    cx: width * 0.38,
    cy: height * 0.42,
    r: height * 0.35,
    ka: 10,
    ks: 30,
    n: 4,
    surface: srcImg,
    dot: dotG8,
  });
  drawSphere({
    cx: width * 0.68,
    cy: height * 0.6,
    r: height * 0.28,
    ka: 10,
    ks: 40,
    n: 8,
    surface: srcImg,
    dot: dotG8,
  });
  const saveDemoImg = async (img: Surface, shortName: string) => {
    const stream = await getTestFile(__dirname, shortName, "w");
    const fmt = formatForSaveFromSurface(img);
    await savePnm(fmt, stream, {});
  };
  const makeBW = (cvt: (src: Uint8Array, dst: Uint8Array) => void): Surface => {
    const dstImg = SurfaceStd.create(width, height, 1, { colorModel: "Gray" });
    for (let y = 0; y < height; y++) {
      cvt(srcImg.getRowBuffer(y), dstImg.getRowBuffer(y));
    }
    return dstImg;
  };
  await saveDemoImg(srcImg, "g8-g1-src.pgm");

  // Test for CvtGray8to1Fast
  const dstImgNodith = makeBW((src: Uint8Array, dst: Uint8Array) =>
    CvtGray8to1Fast.cvt(
      width,
      src.buffer,
      src.byteOffset,
      dst.buffer,
      dst.byteOffset
    )
  );
  await saveDemoImg(dstImgNodith, "g8-g1-dst-nodith.pbm");

  // Test for CvtGray8to1Dither
  const ctx = createFloydSteinberg8(width, 1);
  const dstImgDith = makeBW((src: Uint8Array, dst: Uint8Array) =>
    CvtGray8to1Dither.cvt(
      width,
      src.buffer,
      src.byteOffset,
      dst.buffer,
      dst.byteOffset,
      ctx
    )
  );
  await saveDemoImg(dstImgDith, "g8-g1-dst-dith.pbm");
});
