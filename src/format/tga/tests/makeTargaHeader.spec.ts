import { makeTargaHeader } from "../makeTargaHeader";
import { createInfo, createInfoSign } from "../../../ImageInfo";
import { TargaImageType } from "../TargaHeader";
import { createGrayPalette } from "../../../Palette";

test("makeTargaHeader", () => {
  const w = 12;
  const h = 8;
  expect(() =>
    makeTargaHeader(createInfoSign(w, h, "R8G8B8"), {})
  ).toThrowError("Invalid Targa image type: R8G8B8");

  expect(makeTargaHeader(createInfoSign(w, h, "B8G8R8"), {})).toEqual({
    idLength: 0,
    colorMapType: 0,
    imageType: TargaImageType.uncompressedTrueColor,
    colorMapStart: 0,
    colorMapLength: 0,
    colorItemSize: 0,
    x0: 0,
    y0: 0,
    width: w,
    height: h,
    depth: 24,
    imageDescriptor: 0,
  });

  expect(
    makeTargaHeader(createInfoSign(w, h, "B8G8R8"), {
      compression: true,
      top2bottom: true,
    })
  ).toEqual({
    idLength: 0,
    colorMapType: 0,
    imageType: TargaImageType.rleTrueColor,
    colorMapStart: 0,
    colorMapLength: 0,
    colorItemSize: 0,
    x0: 0,
    y0: h,
    width: w,
    height: h,
    depth: 24,
    imageDescriptor: 0x20,
  });

  expect(makeTargaHeader(createInfoSign(w, h, "G8"), {})).toEqual({
    idLength: 0,
    colorMapType: 0,
    imageType: TargaImageType.uncompressedGray,
    colorMapStart: 0,
    colorMapLength: 0,
    colorItemSize: 0,
    x0: 0,
    y0: 0,
    width: w,
    height: h,
    depth: 8,
    imageDescriptor: 0,
  });

  expect(
    makeTargaHeader(createInfoSign(w, h, "G8"), { compression: true })
  ).toEqual({
    idLength: 0,
    colorMapType: 0,
    imageType: TargaImageType.rleGray,
    colorMapStart: 0,
    colorMapLength: 0,
    colorItemSize: 0,
    x0: 0,
    y0: 0,
    width: w,
    height: h,
    depth: 8,
    imageDescriptor: 0,
  });

  expect(
    makeTargaHeader(
      createInfo(w, h, 8, "Indexed", false, createGrayPalette(20)),
      {}
    )
  ).toEqual({
    idLength: 0,
    colorMapType: 1,
    imageType: TargaImageType.uncompressedColorMapped,
    colorMapStart: 0,
    colorMapLength: 20,
    colorItemSize: 24,
    x0: 0,
    y0: 0,
    width: w,
    height: h,
    depth: 8,
    imageDescriptor: 0,
  });
  expect(
    makeTargaHeader(
      createInfo(w, h, 8, "Indexed", false, createGrayPalette(20)),
      { compression: true }
    )
  ).toEqual({
    idLength: 0,
    colorMapType: 1,
    imageType: TargaImageType.rleColorMapped,
    colorMapStart: 0,
    colorMapLength: 20,
    colorItemSize: 24,
    x0: 0,
    y0: 0,
    width: w,
    height: h,
    depth: 8,
    imageDescriptor: 0,
  });
});
