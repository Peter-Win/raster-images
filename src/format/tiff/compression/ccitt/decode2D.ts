import { BitFiller } from "./BitFiller";
import { BitReader } from "./BitReader";
import { DecodeModifiedHuffmanTables } from "./createDecodeMHTables";
import { MHIndex } from "./mhCodes";

export const maxCodeLength = 30;

export const getCodeLength = (
  reader: BitReader,
  color: MHIndex,
  mhTables: DecodeModifiedHuffmanTables
): number => {
  let code = "";
  let sumLen = 0;
  for (;;) {
    if (reader.isEnd()) throw Error("Unexpected end of data");
    if (code.length > maxCodeLength)
      throw Error(`Too long ${["W", "B"][color]} code ${code}`);
    code += reader.getStrBit();
    const longLen = mhTables.addMkUp[code] ?? mhTables.mkUp[color][code];
    if (longLen) {
      sumLen += longLen;
      code = "";
      continue;
    }
    const len = mhTables.term[color][code];
    if (typeof len === "number") {
      return len + sumLen;
    }
  }
};

const codeWordStr = (color: MHIndex, length: number): string =>
  "".padEnd(length, ["0", "1"][color]);

const calcRelativeLength = (
  curColor: MHIndex,
  a0: number,
  prevRow: string,
  leftDelta: number
) => {
  const width = prevRow.length;
  const sCurColor = codeWordStr(curColor, 1);
  let b1 = a0;
  // Если цвета не совпадают, то нужно пропускать, пока не будет найден совпадающий цвет
  // Но опытным путём выяснено: если строка начинается с черного цвета, то пропускать не надо.
  // see ccitt_8.tif, start of line 1186:
  //             646        1680
  //      0123...v          v
  // 1185 BBBB...BWBBBBB...BWWWWW
  // 1186 BBBB...BBBBBBB...BWWWWW
  // V0 (W len=0), Pass (B len=648), V0 (B len=1032), V0 (W len=48)
  if (a0 !== 0) while (b1 < width && prevRow[b1] !== sCurColor) b1++;
  // Теперь пропускать тот цвет, который совпадает с a0
  while (b1 < width && prevRow[b1] === sCurColor) b1++;
  return b1 - a0 - leftDelta;
};

/** Команды, выполняющие заключительную часть декодирования 2D сжатия
 */
export const createDecoder2DCmd = (width: number, writer: BitFiller) => {
  let color: MHIndex = MHIndex.white;
  let a0 = 0;
  let prevRow = codeWordStr(MHIndex.white, width);
  let curRow = "";
  return {
    vert: (leftDelta: number) => {
      const len = calcRelativeLength(color, a0, prevRow, leftDelta);
      writer.fill(color, len);
      curRow += codeWordStr(color, len);
      a0 += len;
      color ^= 1;
    },
    horiz: (reader: BitReader, mhTables: DecodeModifiedHuffmanTables) => {
      const nextColor: MHIndex = color ^ 1;
      const firstLen = getCodeLength(reader, color, mhTables);
      const secondLen = getCodeLength(reader, nextColor, mhTables);
      writer.fill(color, firstLen);
      writer.fill(nextColor, secondLen);
      curRow += codeWordStr(color, firstLen);
      curRow += codeWordStr(nextColor, secondLen);
      a0 += firstLen + secondLen;
    },
    pass: () => {
      let b2 = a0;
      const curChar = codeWordStr(color, 1);
      while (b2 < width && prevRow[b2] !== curChar) b2++; // пропуск не такого цвета
      while (b2 < width && prevRow[b2] === curChar) b2++; // пропуск совпадающего цвета (то есть до b1)
      while (b2 < width && prevRow[b2] !== curChar) b2++;
      const len = b2 - a0;
      writer.fill(color, len);
      curRow += codeWordStr(color, len);
      a0 += len;
    },
    endRow: () => {
      prevRow = curRow;
      curRow = "";
      color = MHIndex.white;
      a0 = 0;
    },
    get x(): number {
      return a0;
    },
    get prevRow(): string {
      return prevRow;
    },
  };
};
