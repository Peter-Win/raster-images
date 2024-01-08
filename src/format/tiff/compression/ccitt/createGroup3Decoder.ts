import { RAStream } from "../../../../stream";
import { Point } from "../../../../math";
import { Ifd } from "../../ifd/Ifd";
import { TiffFillOrder } from "../../tags/TiffFillOrder";
import { BitFiller } from "./BitFiller";
import { BitReader } from "./BitReader";
import { createDecodeMHTables } from "./createDecodeMHTables";
import { EOL, EolCode, MHIndex } from "./mhCodes";
import { TiffTag } from "../../TiffTag";
import { ErrorRI } from "../../../../utils";

export const createGroup3Decoder = async (
  rowSize: number,
  ifd: Ifd,
  stream: RAStream
) => {
  const fillOrder = await ifd.getSingleNumber<TiffFillOrder>(
    TiffTag.FillOrder,
    stream,
    TiffFillOrder.lowColInHiBit
  );
  const options = await ifd.getSingleNumber<number>(
    TiffTag.T4Options,
    stream,
    0
  );
  if (options & 1) {
    // Если 1, значит используется 2D-кодирование CCITT
    // Пока не удалось найти примеров таких файлов
    throw new ErrorRI("T4 with 2D coding not supported yet");
  } // Иначе просто набор стандартных кодов Хаффмана

  const stripEncoder = (src: Uint8Array, stripSize: Point) => {
    const reader = new BitReader(src, fillOrder);
    const ctx = createDecodeMHTables();
    const dst = new Uint8Array(rowSize * stripSize.y);
    const writer = new BitFiller(dst);

    for (let y = 0; y < stripSize.y; y++) {
      writer.seek(y * rowSize);
      let code = "";
      // The row must be start from EOL code
      for (;;) {
        if (reader.isEnd()) {
          throw new ErrorRI("Unexpected end of strip");
        }
        code += reader.getStrBit();
        if (code.endsWith(EolCode)) {
          // Игнорируются лишние коды, которые появляются перед символом EOL
          break;
        }
      }
      let color: MHIndex = MHIndex.white;
      let x = 0;
      while (x < stripSize.x) {
        code = "";
        for (;;) {
          if (reader.isEnd()) {
            throw new ErrorRI("Unexpected end of strip x=<x>, y=<y>", { x, y });
          }
          code += reader.getStrBit();
          let termFlag = 0;
          let length = ctx.addMkUp[code];
          if (!length) {
            length = ctx.mkUp[color][code];
          }
          if (length === EOL) {
            throw new ErrorRI("Unexpected EOL");
          }
          if (!length) {
            length = ctx.term[color][code];
            termFlag = 1;
          }
          if (length !== undefined) {
            writer.fill(color, length);
            x += length;
            color ^= termFlag;
            break;
          }
        }
      }
      if (x > stripSize.x) {
        throw new ErrorRI("Too long line x=<x>, width=<width>", {
          x,
          width: stripSize.x,
        });
      }
    }
    return dst;
  };
  return {
    stripEncoder,
  };
};
