import { SurfaceStd } from "../../Surface";
import { CvtI1toI8 } from "../../cvt/indexed/CvtIndexedToIndexedExt";
import { SurfaceReader } from "../../transfer/SurfaceReader";
import { dump } from "../../utils";
import { PaletteShareConverter } from "../PaletteShareConverter";

test("PaletteShareConverter", async () => {
  const w = 5;
  const h = 3;
  const converter = new PaletteShareConverter("I1", "I8", CvtI1toI8);

  // 1 0 0 1 0    90
  // 1 0 1 0 1    A8
  // 0 1 0 0 1    48

  const srcImage = SurfaceStd.create(w, h, 1, {
    colorModel: "Indexed",
    palette: [
      [0, 128, 0, 255],
      [255, 255, 0, 255],
    ],
    data: new Uint8Array([0x90, 0xa8, 0x48]),
  });

  const dstImage = SurfaceStd.create(w, h, 8, { colorModel: "Indexed" });
  expect(dstImage.info.fmt.palette).toBeUndefined();
  const reader2 = new SurfaceReader(dstImage);

  const reader1 = converter.createReader(reader2);
  await reader1.onStart(srcImage.info);
  expect(dstImage.info.fmt.palette).toBeDefined();
  expect(JSON.stringify(dstImage.info.fmt.palette)).toBe(
    "[[0,128,0,255],[255,255,0,255]]"
  );

  const buf0 = await reader1.getRowBuffer(0);
  const srcRow0 = srcImage.getRowBuffer(0);
  for (let i = 0; i < srcImage.rowSize; i++) buf0[i] = srcRow0[i]!;
  await reader1.finishRow(0);

  const dstRow0 = dstImage.getRowBuffer(0);
  expect(dump(dstRow0)).toBe("01 00 00 01 00");
});
