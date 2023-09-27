import { Surface, SurfaceStd } from "../../../Surface";
import { saveBmp } from "../../../format/bmp/saveBmp";
import { formatForSaveFromSurface } from "../../../format/FormatForSave";
import { getTestFile } from "../../../tests/getTestFile";
import { dot24, drawSphere } from "../../../tests/drawSphere";
import { Cvt24to15Dither, Cvt24to15Fast } from "../Cvt24to15";
import { createFloydSteinberg8 } from "../../dithering/FloydSteinberg";
import { dumpA } from "../../../utils";

test("Cvt24to15Fast", () => {
  const src = new Uint8Array(
    [
      [0x55, 0x55], // ignored
      [0, 0, 0], // black
      [7, 7, 7], // reduced to black
      [8, 10, 15], // reduced to 1,1,1
      [248, 248, 248], // reduced to white (0x7FFF) = [31,31,31]
      [247, 247, 247], // [30,30,30]
      [0, 0, 255], // red
      [0, 127, 255], // orange
      [0, 255, 255], // yellow
      [0, 127, 127], // brown
      [255, 0, 255], // magenta
      [0xaa, 0xaa], // ignored
    ].flatMap((v) => v)
  );
  const width = Math.round((src.length - 4) / 3);
  const dst = new Uint16Array(width + 6);
  dst.fill(0xffff);
  Cvt24to15Fast.cvt(
    width,
    src.buffer,
    src.byteOffset + 2,
    dst.buffer,
    dst.byteOffset + 3 * 2
  );
  expect(Array.from(dst).map((n) => n.toString(2).padStart(16, "0"))).toEqual([
    "1111111111111111",
    "1111111111111111",
    "1111111111111111",
    "0000000000000000", // black
    "0000000000000000", // black
    "0000010000100001", // [1,1,1]
    "0111111111111111", // white
    "0111101111011110", // [30,30,30]
    "0111110000000000", // red
    "0111110111100000", // orange
    "0111111111100000", // yellow
    "0011110111100000", // brown
    "0111110000011111", // magenta
    "1111111111111111",
    "1111111111111111",
    "1111111111111111",
  ]);
});

test("Cvt24to15Dither", () => {
  const width = 6;
  const src0 = new Uint8Array(width * 3);
  src0.fill(7); // in fast conversion 7 reduced to 0 because  7 >> 3 = 0
  const src1 = new Uint8Array(width * 3);
  src1.fill(3);
  const dst0 = new Uint16Array(width);
  const dst1 = new Uint16Array(width);
  const ctx = createFloydSteinberg8(width, 3);
  Cvt24to15Dither.cvt(
    width,
    src0.buffer,
    src0.byteOffset,
    dst0.buffer,
    dst0.byteOffset,
    ctx
  );
  Cvt24to15Dither.cvt(
    width,
    src1.buffer,
    src1.byteOffset,
    dst1.buffer,
    dst1.byteOffset,
    ctx
  );
  expect(dumpA(Array.from(dst0))).toBe("00 0421 0421 00 0421 0421");
  expect(dumpA(Array.from(dst1))).toBe("0421 00 00 0421 00 00");
});

test("Cvt24to15", async () => {
  // Сравнительный визуальный тест
  const saveDemoImg = async (img: Surface, shortName: string) => {
    const fmt = formatForSaveFromSurface(img);
    const stream = await getTestFile(__dirname, shortName, "w");
    await saveBmp(fmt, stream);
  };
  const L = 300;
  const r = (L / 2) * 0.8;
  const width = 3 * L;
  const height = 2 * L;
  const srcImg = SurfaceStd.create(width, height, 24);
  // fill by gradient
  for (let y = 0; y < height; y++) {
    srcImg.getRowBuffer(y).fill((y / height) * 80);
  }
  type SphDef = {
    ks: number;
    n: number;
    color: [number, number, number];
  };
  const spheres: SphDef[] = [
    { ks: 20, n: 3, color: [0, 0, 1] },
    { ks: 30, n: 3, color: [0, 0.5, 1] },
    { ks: 40, n: 3, color: [0, 1, 1] },
    { ks: 20, n: 4, color: [0.5, 1, 0] },
    { ks: 30, n: 4, color: [1, 0.5, 0] },
    { ks: 40, n: 4, color: [1, 0.9, 0.8] },
  ];
  spheres.forEach((s, i) =>
    drawSphere({
      cx: L / 2 + (i % 3) * L,
      cy: L / 2 + Math.floor(i / 3) * L,
      r,
      ka: 10,
      ks: s.ks,
      n: s.n,
      surface: srcImg,
      dot: dot24(s.color),
    })
  );
  const cvtImg = (
    cvtRow: (src: Uint8Array, dst: Uint8Array) => void
  ): Surface => {
    const dstImg = SurfaceStd.create(width, height, 15);
    for (let y = 0; y < height; y++) {
      cvtRow(srcImg.getRowBuffer(y), dstImg.getRowBuffer(y));
    }
    return dstImg;
  };
  await saveDemoImg(srcImg, "24-15-src.bmp");

  const dstImgFast = cvtImg((src: Uint8Array, dst: Uint8Array) => {
    Cvt24to15Fast.cvt(
      width,
      src.buffer,
      src.byteOffset,
      dst.buffer,
      dst.byteOffset
    );
  });
  await saveDemoImg(dstImgFast, "24-15-dst-fast.bmp");

  const ctx = createFloydSteinberg8(width, 3);
  const dstImgDith = cvtImg((src: Uint8Array, dst: Uint8Array) => {
    Cvt24to15Dither.cvt(
      width,
      src.buffer,
      src.byteOffset,
      dst.buffer,
      dst.byteOffset,
      ctx
    );
  });
  await saveDemoImg(dstImgDith, "24-15-dst-dith.bmp");
});
