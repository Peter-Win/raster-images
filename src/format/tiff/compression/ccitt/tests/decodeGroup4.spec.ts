import { onStreamFromGallery } from "../../../../../tests/streamFromGallery";
import { FormatTiff } from "../../../FormatTiff";
import { TiffTag } from "../../../TiffTag";
import { TiffCompression } from "../../../tags/TiffCompression";
import { TiffFillOrder } from "../../../tags/TiffFillOrder";
import { BitFiller } from "../BitFiller";
import { BitReader } from "../BitReader";
import { createDecodeMHTables } from "../createDecodeMHTables";
import { MRCodeId, mrDecodeDict } from "../mrCodes";
import { createDecoder2DCmd } from "../decode2D";
import { gray1toGray8 } from "../../../../../Converter/rowOps/gray/gray1toGray";
import { helloImg } from "./helloImg";
import { calcPitch } from "../../../../../ImageInfo/calcPitch";
import { ErrorRI } from "../../../../../utils";

const decode = (
  width: number,
  height: number,
  packedData: Uint8Array,
  fillOrder: TiffFillOrder
): Uint8Array => {
  const rowSize = calcPitch(width, 1);
  const reader = new BitReader(packedData, fillOrder);
  const dst = new Uint8Array(rowSize * height);
  const writer = new BitFiller(dst);
  const mhTables = createDecodeMHTables();
  const cmd = createDecoder2DCmd(width, writer);
  const mrExecDict: Record<MRCodeId, () => void> = {
    Horiz: () => cmd.horiz(reader, mhTables),
    Vl3: () => cmd.vert(3),
    Vl2: () => cmd.vert(2),
    Vl1: () => cmd.vert(1),
    V0: () => cmd.vert(0),
    Vr1: () => cmd.vert(-1),
    Vr2: () => cmd.vert(-2),
    Vr3: () => cmd.vert(-3),
    Pass: () => cmd.pass(),
    Ext1D: () => {
      let c = "";
      for (let i = 0; i < 20; i++) c += reader.getStrBit();
      throw Error(`Ext1D ${c}`);
    },
    Ext2D: () => {
      let c = "";
      for (let i = 0; i < 20; i++) c += reader.getStrBit();
      throw Error(`Ext2D ${c}`);
    },
  };
  for (let y = 0; y < height; y++) {
    writer.seek(y * rowSize);
    while (cmd.x < width) {
      let code = "";
      for (;;) {
        if (reader.isEnd()) {
          throw new ErrorRI(
            "Unexpected end of data. x=<x>, y=<y>, code=<code>",
            { x: cmd.x, y, code }
          );
        }
        if (code.length > 20) {
          throw new ErrorRI("Too long code. x=<x>, y=<y>, code=<code>", {
            x: cmd.x,
            y,
            code,
          });
        }
        code += reader.getStrBit();
        const mr = mrDecodeDict[code];
        if (!mr) continue;
        mrExecDict[mr]?.();
        break;
      }
    }
    cmd.endRow();
  }
  return dst;
};

describe("decodeGroup4", () => {
  it("small tiff", async () => {
    await onStreamFromGallery("tiff/group4.tif", async (stream) => {
      const fmt = await FormatTiff.create(stream);
      const frm = fmt.frames[0]!;
      expect(frm.info.fmt.signature).toBe("G1");
      const { x: width, y: height } = frm.info.size;
      const { ifd } = frm;
      const compressionId = await ifd.getSingleNumber<TiffCompression>(
        TiffTag.Compression,
        stream
      );
      expect(compressionId).toBe(TiffCompression.Group4Fax);
      const fillOrder = await ifd.getSingleNumber<TiffFillOrder>(
        TiffTag.FillOrder,
        stream,
        TiffFillOrder.lowColInHiBit
      );
      const sizes = await ifd.getNumbers(TiffTag.StripByteCounts, stream);
      const offsets = await ifd.getNumbers(TiffTag.StripOffsets, stream);
      expect(sizes.length).toBe(1);
      expect(offsets.length).toBe(1);
      await stream.seek(offsets[0]!);
      const packedData = await stream.read(sizes[0]!);

      const dst = decode(width, height, packedData, fillOrder);

      const buf = new Uint8Array(width);
      const rowSize = calcPitch(width, 1);
      for (let y = 0; y < height; y++) {
        gray1toGray8(
          width,
          new Uint8Array(dst.buffer, dst.byteOffset + y * rowSize, rowSize),
          buf
        );
        const str =
          String(y) +
          Array.from(buf)
            .map((n) => (n ? "X" : " "))
            .join("");
        expect(str).toBe(helloImg[y]);
      }
    });
  });

  it("long group4", async () => {
    // В этом файле присутствует длинная строка в коде Horiz, которая состоит из нескольких кодов.
    await onStreamFromGallery("tiff/group4-long.tif", async (stream) => {
      const fmt = await FormatTiff.create(stream);
      const frm = fmt.frames[0]!;
      expect(frm.info.fmt.signature).toBe("G1");
      const { x: width, y: height } = frm.info.size;
      const { ifd } = frm;
      const compressionId = await ifd.getSingleNumber<TiffCompression>(
        TiffTag.Compression,
        stream
      );
      expect(compressionId).toBe(TiffCompression.Group4Fax);
      const fillOrder = await ifd.getSingleNumber<TiffFillOrder>(
        TiffTag.FillOrder,
        stream,
        TiffFillOrder.lowColInHiBit
      );
      const options = await ifd.getSingleNumber<number>(
        TiffTag.T6Options,
        stream,
        0
      );
      expect(options).toBe(0);
      const sizes = await ifd.getNumbers(TiffTag.StripByteCounts, stream);
      const offsets = await ifd.getNumbers(TiffTag.StripOffsets, stream);
      expect(sizes.length).toBe(1);
      expect(offsets.length).toBe(1);
      await stream.seek(offsets[0]!);
      const packedData = await stream.read(sizes[0]!);

      const dst = decode(width, height, packedData, fillOrder);

      const buf = new Uint8Array(width);
      const rowSize = calcPitch(width, 1);
      for (let y = 0; y < height; y++) {
        gray1toGray8(
          width,
          new Uint8Array(dst.buffer, dst.byteOffset + y * rowSize, rowSize),
          buf
        );
        const sum = Array.from(buf).reduce((acc, n) => acc + n, 0);
        if (y === 0 || y === height - 1) {
          expect(sum).toBe(0);
        } else if (y === 1 && y === height - 2) {
          expect(sum).toBe(255 * (width - 2));
        }
      }
    });
  });
});
