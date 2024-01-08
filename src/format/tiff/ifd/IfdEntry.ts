import {
  FieldsBlock,
  fieldDword,
  fieldWord,
  readFieldsBlock,
} from "../../FieldsBlock";
import { RAStream } from "../../../stream";
import { ErrorRI, bytesToUtf8 } from "../../../utils";
import { IfdType, typeDef } from "./IfdType";

export interface IfdEntry {
  tagId: number;
  type: IfdType;
  count: number;
  valueOffset: DataView; // to get offset:  valueOffset.getUint32(0, littleEndian)
}

export const getIfdDataSize = (ifd: IfdEntry): number =>
  typeDef[ifd.type]!.size * ifd.count;

const descrIfdEntry = (littleEndian: boolean): FieldsBlock<IfdEntry> => ({
  littleEndian,
  fields: [
    fieldWord("tagId"),
    fieldWord("type"),
    fieldDword("count"),
    {
      key: "valueOffset",
      size: 4,
      fromBuf: (buf, offset) =>
        new DataView(buf.buffer, buf.byteOffset + offset),
    },
  ],
});

export const loadIfdEntry = async (
  stream: RAStream,
  littleEndian: boolean
): Promise<IfdEntry> => {
  const entry = await readFieldsBlock(stream, descrIfdEntry(littleEndian));
  if (!typeDef[entry.type]) {
    throw new ErrorRI("Unsupported IFD type=<t>", { t: entry.type });
  }
  return entry;
};

export const getIfdData = async (
  entry: IfdEntry,
  stream: RAStream,
  littleEndian: boolean
): Promise<DataView> => {
  const { valueOffset } = entry;
  const size = getIfdDataSize(entry);
  if (size <= 4) {
    return valueOffset;
  }
  const offset = valueOffset.getUint32(0, littleEndian);
  await stream.seek(offset);
  const buf = await stream.read(size);
  return new DataView(buf.buffer, buf.byteOffset);
};

export const getIfdDataBytes = async (
  entry: IfdEntry,
  stream: RAStream,
  littleEndian: boolean
): Promise<Uint8Array> => {
  const { valueOffset } = entry;
  const size = getIfdDataSize(entry);
  if (size <= 4) {
    return new Uint8Array(valueOffset.buffer, valueOffset.byteOffset);
  }
  const offset = valueOffset.getUint32(0, littleEndian);
  await stream.seek(offset);
  return stream.read(size);
};

export const getIfdNumbers = async (
  entry: IfdEntry,
  stream: RAStream,
  littleEndian: boolean
): Promise<number[]> => {
  const data = await getIfdData(entry, stream, littleEndian);
  const { count } = entry;
  const { getNumber } = typeDef[entry.type]!;
  const result: number[] = new Array(count);
  for (let i = 0; i < count; i++) {
    result[i] = getNumber(data, i, littleEndian);
  }
  return result;
};

export const getIfdSingleNumber = async (
  entry: IfdEntry,
  stream: RAStream,
  littleEndian: boolean
): Promise<number> => {
  const nums = await getIfdNumbers(entry, stream, littleEndian);
  if (nums.length !== 1)
    throw new ErrorRI("Expected 1 number in <f>, but found <n>", {
      f: entry.tagId.toString(16),
      n: nums.length,
    });
  return nums[0]!;
};

export const getIfdString = async (
  entry: IfdEntry,
  stream: RAStream,
  littleEndian: boolean
): Promise<string> => {
  if (entry.type !== IfdType.ascii)
    throw new ErrorRI("Can't get string from <t>", {
      t: typeDef[entry.type]?.name,
    });
  const data = await getIfdData(entry, stream, littleEndian);
  return bytesToUtf8(
    new Uint8Array(data.buffer, data.byteOffset, entry.count - 1)
  );
};
