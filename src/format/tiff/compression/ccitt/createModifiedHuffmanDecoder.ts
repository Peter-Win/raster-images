import { ErrorRI } from "../../../../utils";
import { Point } from "../../../../math";
import { RAStream } from "../../../../stream";
import { Ifd } from "../../ifd/Ifd";
import { TiffFillOrder } from "../../tags/TiffFillOrder";
import { TiffTag } from "../../TiffTag";
import { BitFiller } from "./BitFiller";
import { BitReader } from "./BitReader";
import {
  DecodeModifiedHuffmanTables,
  createDecodeMHTables,
} from "./createDecodeMHTables";
import { EOL, MHIndex } from "./mhCodes";

const decodeRow = (
  width: number,
  reader: BitReader,
  writer: BitFiller,
  ctx: DecodeModifiedHuffmanTables
) => {
  let color: MHIndex = MHIndex.white;
  let codeLength: number | undefined;
  const { term, mkUp, addMkUp } = ctx;
  let x = 0;
  let changeColor: 0 | 1 = 0;
  while (x < width || !changeColor) {
    let code = "";
    changeColor = 0;
    for (;;) {
      if (reader.isEnd()) throw Error("Unexpected end");
      code += reader.getStrBit();
      codeLength = addMkUp[code] ?? mkUp[color][code];
      if (codeLength === EOL) {
        // No EOL code words are used for this compression type!
        return;
      }
      if (codeLength) break;
      codeLength = term[color][code];
      if (codeLength !== undefined) {
        changeColor = 1;
        break;
      }
      if (code.length > 40) throw new ErrorRI("Too long code <code>", { code });
    }
    if (codeLength !== undefined) {
      writer.fill(color, codeLength);
      x += codeLength;
      color ^= changeColor;
    }
  }
};

export const createModifiedHuffmanDecoder = async (
  rowSize: number,
  ifd: Ifd,
  stream: RAStream
) => {
  const fillOrder = await ifd.getSingleNumber<TiffFillOrder>(
    TiffTag.FillOrder,
    stream,
    TiffFillOrder.lowColInHiBit
  );
  const ctx = createDecodeMHTables();
  return {
    stripEncoder: (src: Uint8Array, stripSize: Point): Uint8Array => {
      const reader = new BitReader(src, fillOrder);
      const dst = new Uint8Array(rowSize * stripSize.y);
      const writer = new BitFiller(dst);
      for (let y = 0; y < stripSize.y; y++) {
        writer.seek(rowSize * y);
        decodeRow(stripSize.x, reader, writer, ctx);
        reader.alignToByte();
      }
      return dst;
    },
  };
};
