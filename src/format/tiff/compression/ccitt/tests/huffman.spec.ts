import { onStreamFromGallery } from "../../../../../tests/streamFromGallery";
import { FormatTiff } from "../../../FormatTiff";
import { TiffTag } from "../../../TiffTag";
import { TiffCompression } from "../../../tags/TiffCompression";
import { TiffFillOrder } from "../../../tags/TiffFillOrder";
import { BitReader } from "../BitReader";
import { createDecodeMHTables } from "../createDecodeMHTables";
import { MHIndex } from "../mhCodes";

test("tiff huffman", async () => {
  await onStreamFromGallery("tiff/g3_rle_longline.tif", async (stream) => {
    const fmt = await FormatTiff.create(stream);
    const frm = fmt.frames[0]!;
    expect(frm).toBeDefined();
    const { ifd, info } = frm;
    const { x: width } = info.size;
    const compressionId = await ifd.getSingleNumber(
      TiffTag.Compression,
      stream
    );
    expect(compressionId).toBe(TiffCompression.CcittHuffman);
    const fillOrder = await ifd.getSingleNumber<TiffFillOrder>(
      TiffTag.FillOrder,
      stream,
      TiffFillOrder.lowColInHiBit
    );
    const sizes = await ifd.getNumbers(TiffTag.StripByteCounts, stream);
    const offsets = await ifd.getNumbers(TiffTag.StripOffsets, stream);
    const stripSize = sizes[0]!;
    expect(stripSize).toBeDefined();
    const stripOffset = offsets[0]!;
    expect(stripOffset).toBeDefined();
    await stream.seek(stripOffset);
    const stripData = await stream.read(stripSize);
    const ctx = createDecodeMHTables();
    const reader = new BitReader(stripData, fillOrder);
    for (let y = 0; y < 100; y++) {
      let color: MHIndex = MHIndex.white;
      let x = 0;
      let changeColor: 0 | 1;
      do {
        let code = "";
        changeColor = 0;
        let codeLength = 0;
        for (;;) {
          if (reader.isEnd()) throw Error("Unexpected end of data");
          if (code.length > 40)
            throw Error(`Too long code ${code}, x=${x}, y=${y}`);
          code += reader.getStrBit();
          let curLen = ctx.addMkUp[code];
          if (curLen) {
            codeLength = curLen;
            break;
          }
          curLen = ctx.mkUp[color][code];
          if (curLen) {
            codeLength = curLen;
            break;
          }
          curLen = ctx.term[color][code];
          if (curLen !== undefined) {
            codeLength = curLen;
            changeColor = 1;
            break;
          }
        }
        x += codeLength;
        color ^= changeColor;
      } while (x < width || !changeColor);
      if (x !== width) throw Error(`Invalid widt ${x} in row ${y}`);
      reader.alignToByte();
    }
  });
});
