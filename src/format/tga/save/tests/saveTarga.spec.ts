import { Surface, SurfaceStd } from "../../../../Surface";
import { dot24, drawSphere } from "../../../../tests/drawSphere";
import { getTestFile } from "../../../../tests/getTestFile";
import { surfaceConverter } from "../../../../Converter/surfaceConverter";
import { saveTarga } from "../saveTarga";
import { createRowsReader, writeImage } from "../../../../Converter";
import { copyBytes } from "../../../../Converter/rowOps/copy/copyBytes";
import { BufferStream, RAStream, streamLock } from "../../../../stream";
import { NodeJSFile } from "../../../../stream/NodeJSFile";
import { TargaImageType, readTargaHeader } from "../../TargaHeader";
import { dump } from "../../../../utils";

const createTestImage = async (dstSign: string): Promise<Surface> => {
  const width = 400;
  const height = 300;
  const srcImg = SurfaceStd.create(width, height, 24);
  const alpha = dstSign === "B8G8R8A8";
  // gradient
  if (!alpha) {
    for (let i = 0; i < height; i++) {
      const row = srcImg.getRowBuffer(i);
      const h = i / 4;
      let pos = 0;
      const endPos = width * 3;
      while (pos < endPos) {
        row[pos++] = h;
        row[pos++] = 0;
        row[pos++] = h / 2;
      }
    }
  }
  [
    { cx: 180, cy: 140, r: 135, n: 4, color: [0, 0.75, 1] },
    { cx: 300, cy: 240, r: 50, n: 6, color: [0.6, 0.4, 1] },
  ].forEach(({ color, ...fields }) =>
    drawSphere({
      ...fields,
      ka: 10,
      ks: 20,
      surface: srcImg,
      dot: dot24(color as [number, number, number]),
    })
  );
  // Test points
  const setPixel = (x: number, y: number, b: number, g: number, r: number) => {
    const row = srcImg.getRowBuffer(y);
    let pos = x * 3;
    row[pos++] = b;
    row[pos++] = g;
    row[pos++] = r;
  };
  setPixel(0, 0, 0, 0, 0xff); // top left = red
  setPixel(width - 1, 0, 0, 0xff, 0); // top right = green
  setPixel(0, height - 1, 0xff, 0, 0); // bottom left = blue
  setPixel(width - 1, height - 1, 0xff, 0, 0xff); // bottom right = magenta

  if (dstSign === "B8G8R8") return srcImg;
  const dstImg = SurfaceStd.createSign(width, height, dstSign);
  const reader = await createRowsReader(srcImg, dstImg.info.fmt);
  dstImg.setPalette(reader.dstInfo.fmt.palette);
  const { rowSize } = dstImg;
  const fn = async (row: Uint8Array, y: number) => {
    const dst = dstImg.getRowBuffer(y);
    copyBytes(rowSize, row, 0, dst, 0);
    if (alpha) {
      let pos = 0;
      const end = width * 4;
      while (pos < end) {
        const b = dst[pos++]!;
        const g = dst[pos++]!;
        const r = dst[pos++]!;
        dst[pos++] = r === 0 && g === 0 && b === 0 ? 0 : 0xff;
      }
    }
  };
  await writeImage(reader, fn);
  return dstImg;
};

const readRes = async (wstream: RAStream, dataSize: number) =>
  streamLock(new NodeJSFile(wstream.name, "r"), async (rstream) => {
    const hdr = await readTargaHeader(rstream);
    let palette: Uint8Array | undefined;
    if (hdr.colorMapType) {
      palette = await rstream.read(
        hdr.colorMapLength * (hdr.colorItemSize < 24 ? 2 : 3)
      );
    }
    const data = await rstream.read(dataSize);
    return { hdr, palette, data };
  });

describe("saveTarga", () => {
  it("true color", async () => {
    const img = await createTestImage("B8G8R8");
    const reader = await surfaceConverter(img).getRowsReader();
    const stream = await getTestFile(__dirname, "bgr24.tga", "w");
    await saveTarga(reader, stream);
    const { hdr, palette, data } = await readRes(stream, 3);
    expect(hdr.imageType).toBe(TargaImageType.uncompressedTrueColor);
    expect(hdr.depth).toBe(24);
    expect(palette).toBeUndefined();
    expect(dump(data)).toBe("FF 00 00"); // left bottom pixel
  });

  it("color map", async () => {
    const img = await createTestImage("I8");
    expect(img.palette).toBeDefined();
    const reader = await surfaceConverter(img).getRowsReader();
    const stream = await getTestFile(__dirname, "palette.tga", "w");
    await saveTarga(reader, stream);
    const { hdr, palette } = await readRes(stream, 1);
    expect(hdr.colorMapType).toBe(1);
    expect(hdr.imageType).toBe(TargaImageType.uncompressedColorMapped);
    expect(hdr.colorItemSize).toBe(24);
    expect(hdr.depth).toBe(8);
    expect(palette?.length).toBe(img.palette!.length * 3);
  });

  it("alpha", async () => {
    const img = await createTestImage("B8G8R8A8");
    const reader = await surfaceConverter(img).getRowsReader();
    const stream = await getTestFile(__dirname, "bgr32.tga", "w");
    await saveTarga(reader, stream);
    const { hdr, data } = await readRes(stream, 4);
    expect(hdr.colorMapType).toBe(0);
    expect(hdr.imageType).toBe(TargaImageType.uncompressedTrueColor);
    expect(hdr.depth).toBe(32);
    expect(hdr.imageDescriptor).toBe(8);
    expect(dump(data)).toBe("FF 00 00 FF"); // blue + alpha
  });

  it("15 bit", async () => {
    const img = await createTestImage("B5G5R5");
    const reader = await surfaceConverter(img).getRowsReader();
    const stream = await getTestFile(__dirname, "bgr15.tga", "w");
    await saveTarga(reader, stream);
    const { hdr, data } = await readRes(stream, 2);
    expect(hdr.colorMapType).toBe(0);
    expect(hdr.imageType).toBe(TargaImageType.uncompressedTrueColor);
    expect(hdr.depth).toBe(16);
    expect(hdr.imageDescriptor).toBe(0);
    expect(dump(data)).toBe("1F 00"); // 0rrr.rrgg.gggb.bbbb
  });

  it("gray", async () => {
    const img = await createTestImage("G8");
    const reader = await surfaceConverter(img).getRowsReader();
    const stream = await getTestFile(__dirname, "gray.tga", "w");
    await saveTarga(reader, stream);
    const { hdr } = await readRes(stream, 1);
    expect(hdr.colorMapType).toBe(0);
    expect(hdr.imageType).toBe(TargaImageType.uncompressedGray);
    expect(hdr.depth).toBe(8);
    expect(hdr.imageDescriptor).toBe(0);
  });

  it("rle gray", async () => {
    const img = await createTestImage("G8");
    const reader = await surfaceConverter(img).getRowsReader();
    const stream = await getTestFile(__dirname, "gray-rle.tga", "w");
    await saveTarga(reader, stream, { compression: true });
    const { hdr } = await readRes(stream, 1);
    expect(hdr.colorMapType).toBe(0);
    expect(hdr.imageType).toBe(TargaImageType.rleGray);
    expect(hdr.depth).toBe(8);
    expect(hdr.imageDescriptor).toBe(0);
  });

  it("rle true color 24", async () => {
    const img = await createTestImage("B8G8R8");
    const reader = await surfaceConverter(img).getRowsReader();
    const stream = await getTestFile(__dirname, "bgr24-rle.tga", "w");
    await saveTarga(reader, stream, { compression: true });
    const { hdr, data } = await readRes(stream, 4);
    expect(hdr.imageType).toBe(TargaImageType.rleTrueColor);
    expect(dump(data)).toBe("00 FF 00 00"); // litelal chunk with 1 pixel code = 00, + blue
  });

  it("rle color map", async () => {
    const img = await createTestImage("I8");
    expect(img.palette).toBeDefined();
    const reader = await surfaceConverter(img).getRowsReader();
    const stream = await getTestFile(__dirname, "palette-rle.tga", "w");
    await saveTarga(reader, stream, { compression: true });
    const { hdr, data } = await readRes(stream, 1);
    expect(hdr.colorMapType).toBe(1);
    expect(hdr.imageType).toBe(TargaImageType.rleColorMapped);
    expect(hdr.colorItemSize).toBe(24);
    expect(hdr.depth).toBe(8);
    expect(dump(data)).toBe("00");
  });

  it("top2bottom", async () => {
    const img = await createTestImage("B8G8R8");
    const reader = await surfaceConverter(img).getRowsReader();
    const stream = await getTestFile(__dirname, "top2bottom.tga", "w");
    await saveTarga(reader, stream, { top2bottom: true });
    const { hdr, data } = await readRes(stream, 3);
    expect(hdr.imageType).toBe(TargaImageType.uncompressedTrueColor);
    expect(hdr.depth).toBe(24);
    expect(hdr.y0).toBe(300);
    expect(hdr.imageDescriptor).toBe(0x20);
    expect(dump(data)).toBe("00 00 FF"); // left top pixel
  });

  it("right2left", async () => {
    const img = await createTestImage("B8G8R8");
    const reader = await surfaceConverter(img).getRowsReader();
    const stream = await getTestFile(__dirname, "right2left.tga", "w");
    await saveTarga(reader, stream, { right2left: true });
    const { hdr, data } = await readRes(stream, 3);
    expect(hdr.imageType).toBe(TargaImageType.uncompressedTrueColor);
    expect(hdr.depth).toBe(24);
    expect(hdr.x0).toBe(400);
    expect(hdr.imageDescriptor).toBe(0x10);
    expect(dump(data)).toBe("FF 00 FF"); // right bottom pixel
  });

  it("right2left", async () => {
    const img = await createTestImage("B8G8R8");
    const reader = await surfaceConverter(img).getRowsReader();
    const stream = await getTestFile(__dirname, "bothrev.tga", "w");
    await saveTarga(reader, stream, { right2left: true, top2bottom: true });
    const { hdr, data } = await readRes(stream, 3);
    expect(hdr.imageType).toBe(TargaImageType.uncompressedTrueColor);
    expect(hdr.depth).toBe(24);
    expect(hdr.x0).toBe(400);
    expect(hdr.y0).toBe(300);
    expect(hdr.imageDescriptor).toBe(0x30);
    expect(dump(data)).toBe("00 FF 00"); // right top pixel
  });

  it("invalid pixel format", async () => {
    const img = SurfaceStd.create(4, 3, 1, { colorModel: "Gray" });
    const stream = new BufferStream(new Uint8Array(100), { size: 0 });
    const reader = await surfaceConverter(img).getRowsReader();
    await expect(async () => {
      await saveTarga(reader, stream);
    }).rejects.toThrowError("Invalid Targa image type: G1");
  });
});
