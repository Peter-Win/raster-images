import { Point } from "../../../../math";
import { RAStream } from "../../../../stream";
import { TiffTag } from "../../TiffTag";
import { Ifd } from "../../ifd/Ifd";
import { TiffFillOrder } from "../../tags/TiffFillOrder";
import { BitReader } from "./BitReader";
import { BitFiller } from "./BitFiller";
import { createDecodeMHTables } from "./createDecodeMHTables";
import { MRCodeId, mrDecodeDict } from "./mrCodes";
import { createDecoder2DCmd, maxCodeLength } from "./decode2D";

export const createGroup4Decoder = async (
  rowSize: number,
  ifd: Ifd,
  stream: RAStream
) => {
  const fillOrder = await ifd.getSingleNumber<TiffFillOrder>(
    TiffTag.FillOrder,
    stream,
    TiffFillOrder.lowColInHiBit
  );
  const mhTables = createDecodeMHTables();

  const stripEncoder = (src: Uint8Array, stripSize: Point) => {
    const { x: width, y: height } = stripSize;
    const reader = new BitReader(src, fillOrder);
    const dst = new Uint8Array(rowSize * height);
    const writer = new BitFiller(dst);
    const cmd = createDecoder2DCmd(width, writer);
    // Конечно, быстродействие такого кода не очень высокое.
    // Быстрее было бы сразу транслировать код в операцию.
    // Но учитывая очень плохую документацию, для начала нужно отладить правильную работу алгоритма.
    const cmdDict: Record<MRCodeId, () => void> = {
      Horiz: () => cmd.horiz(reader, mhTables),
      Pass: () => cmd.pass(),
      Vl3: () => cmd.vert(3),
      Vl2: () => cmd.vert(2),
      Vl1: () => cmd.vert(1),
      V0: () => cmd.vert(0),
      Vr1: () => cmd.vert(-1),
      Vr2: () => cmd.vert(-2),
      Vr3: () => cmd.vert(-3),
      Ext1D: () => {
        throw Error("Ext1D code don't supported");
      },
      Ext2D: () => {
        throw Error("Ext2D code don't supported");
      },
    };

    for (let y = 0; y < height; y++) {
      writer.seek(y * rowSize);
      while (cmd.x < width) {
        let code = "";
        for (;;) {
          if (reader.isEnd()) throw Error("Unexpected end of data");
          if (code.length > maxCodeLength) throw Error(`Too long code ${code}`);
          code += reader.getStrBit();
          const mrCode = mrDecodeDict[code];
          if (mrCode) {
            cmdDict[mrCode]?.();
            break;
          }
        }
      }
      if (cmd.x !== width) throw Error("Data overflow");
      cmd.endRow();
    }
    return dst;
  };
  return {
    stripEncoder,
  };
};
