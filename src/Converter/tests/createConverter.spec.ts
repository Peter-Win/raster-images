import { createGrayPalette } from "../../Palette";
import { PixelFormat } from "../../PixelFormat";
import { SurfaceStd } from "../../Surface";
import { dump } from "../../utils";
import {
  createConverterForRead,
  createConverterForWrite,
} from "../createConverter";

test("createConverterForRead", async () => {
  const srcPixFmt = new PixelFormat({
    depth: 1,
    colorModel: "Indexed",
    palette: createGrayPalette(2),
  });
  const dstImage = SurfaceStd.createSign(5, 1, "R8G8B8A8");
  const converter = createConverterForRead(srcPixFmt, dstImage);
  const writer = await converter.getRowsWriter({
    size: dstImage.size,
    fmt: srcPixFmt,
  });
  const buf = await writer.getBuffer(0);
  buf[0] = 0xa0;
  await writer.flushBuffer(0);
  await writer.finish();
  expect(dump(dstImage.getRowBuffer(0))).toBe(
    "FF FF FF FF 00 00 00 FF FF FF FF FF 00 00 00 FF 00 00 00 FF"
  );
});

test("createConverterForWrite", async () => {
  const srcImage = SurfaceStd.create(5, 1, 1, {
    colorModel: "Indexed",
    palette: createGrayPalette(2),
    data: new Uint8Array([0xa0]),
  });
  const dstPixFmt = new PixelFormat("R8G8B8A8");
  const converter = createConverterForWrite(srcImage, dstPixFmt);
  const reader = await converter.getRowsReader();
  const row = await reader.readRow(0);
  expect(dump(row)).toBe(
    "FF FF FF FF 00 00 00 FF FF FF FF FF 00 00 00 FF 00 00 00 FF"
  );
});
