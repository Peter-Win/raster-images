import { RAStream } from "../../../stream";
import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { readTiffFileHeader } from "../TiffFileHeader";
import { Ifd } from "../ifd/Ifd";
import { imageInfoFromIfd } from "../imageInfoFromIfd";

const loadInfo = async (stream: RAStream) => {
  const { littleEndian, offset } = await readTiffFileHeader(stream);
  await stream.seek(offset);
  const ifd = new Ifd(littleEndian);
  await ifd.load(stream);
  const info = await imageInfoFromIfd(ifd, stream);
  return info;
};

describe("imageInfoFromIfd", () => {
  it("TIFF RGB8", async () => {
    await onStreamFromGallery("tiff/RGB8.tiff", async (stream) => {
      const info = await loadInfo(stream);
      expect(info.size.toString()).toBe("(120, 82)");
      expect(info.fmt.signature).toBe("R8G8B8");
      expect(info.vars?.compression).toBe("None");
      expect(info.vars?.ImageDescription).toBe(
        "OLYMPUS DIGITAL CAMERA         "
      );
      expect(info.vars?.Make).toBe("OLYMPUS IMAGING CORP.  ");
      expect(info.vars?.Model).toBe("u850SW,S850SW   ");
      expect(info.vars?.resX).toBe(314);
      expect(info.vars?.resY).toBe(314);
      expect(info.vars?.resUnit).toBe("inch");
      expect(info.vars?.Software).toBe("LIBFORMAT (c) Pierre-e Gougelet");
      expect(info.vars?.creationTime).toBe("2011-07-06 01:37:47");
    });
  });
  xit("TIFF Gray16", async () => {
    await onStreamFromGallery("tiff/G16.tif", async (stream) => {
      const info = await loadInfo(stream);
      expect(info.size.toString()).toBe("(200, 200)");
      expect(info.fmt.signature).toBe("G16");
      expect(info.vars?.compression).toBe("None");
    });
  });
  it("TIFF RGB LZW", async () => {
    await onStreamFromGallery("tiff/rgb-lzw.tif", async (stream) => {
      const info = await loadInfo(stream);
      expect(info.size.toString()).toBe("(500, 375)");
      expect(info.fmt.signature).toBe("R8G8B8");
      expect(info.vars?.compression).toBe("LZW");
      expect(info.vars?.ImageDescription).toBe(
        "OLYMPUS DIGITAL CAMERA         "
      );
      expect(info.vars?.Make).toBe("OLYMPUS OPTICAL CO.,LTD");
      expect(info.vars?.Model).toBe("C3040Z");
      expect(info.vars?.resUnit).toBe("inch");
      expect(info.vars?.resX).toBe(72);
      expect(info.vars?.resY).toBe(72);
      expect(info.vars?.Software).toBe("Adobe Photoshop CS Macintosh");
      expect(info.vars?.creationTime).toBe("2006-07-25 11:55:57");
    });
  });
  it("TIFF RGBA", async () => {
    await onStreamFromGallery("tiff/rgba.tiff", async (stream) => {
      const info = await loadInfo(stream);
      expect(info.size.toString()).toBe("(16, 16)");
      expect(info.fmt.signature).toBe("R8G8B8A8");
      expect(info.vars?.compression).toBe("None");
      expect(info.vars?.DocumentName).toBe("python.tiff");
    });
  });
  it("TIFF R12G12B12", async () => {
    await onStreamFromGallery("tiff/shapes_lzw_12bps.tif", async (stream) => {
      const info = await loadInfo(stream);
      expect(info.size.toString()).toBe("(128, 72)");
      expect(info.fmt.signature).toBe("R16G16B16");
      expect(info.vars?.bitsPerSample).toEqual([12, 12, 12]);
    });
  });
  it("TIFF float16", async () => {
    await onStreamFromGallery("tiff/rgb-float16.tif", async (stream) => {
      const info = await loadInfo(stream);
      expect(info.size.toString()).toBe("(858, 619)");
      expect(info.fmt.signature).toBe("R32G32B32");
      expect(info.vars?.float16).toBe(1);
    });
  });
});
