import { ErrorRI } from "../../../utils";

export enum IfdType {
  byte = 1,
  ascii = 2,
  short = 3,
  long = 4,
  rational = 5,
  sbyte = 6,
  undefined = 7,
  sshort = 8,
  slong = 9,
  srational = 10,
  float = 11,
  double = 12,
}

export interface IfdTypeDef {
  size: number;
  name: string;
  getNumber(data: DataView, index: number, littleEndian: boolean): number;
}

export const typeDef: Record<IfdType, IfdTypeDef> = {
  [IfdType.byte]: {
    size: 1,
    name: "Byte",
    getNumber: (data, index) => data.getUint8(index),
  },
  [IfdType.ascii]: {
    size: 1,
    name: "Ascii",
    getNumber: () => {
      throw new ErrorRI("Can't get number from Ascii");
    },
  },
  [IfdType.short]: {
    size: 2,
    name: "Short",
    getNumber: (data, index, littleEndian) =>
      data.getUint16(index * 2, littleEndian),
  },
  [IfdType.long]: {
    size: 4,
    name: "Long",
    getNumber: (data, index, littleEndian) =>
      data.getUint32(index * 4, littleEndian),
  },
  [IfdType.rational]: {
    size: 8,
    name: "Rational",
    getNumber: (data, index, littleEndian) =>
      data.getUint32(index * 8, littleEndian) /
      data.getUint32(index * 8 + 4, littleEndian),
  },
  [IfdType.sbyte]: {
    size: 1,
    name: "sByte",
    getNumber: (data, index) => data.getInt8(index),
  },
  [IfdType.undefined]: {
    size: 1,
    name: "Undefined",
    getNumber: (data, index) => data.getInt8(index),
  },
  [IfdType.sshort]: {
    size: 2,
    name: "sShort",
    getNumber: (data, index, littleEndian) =>
      data.getInt16(index * 2, littleEndian),
  },
  [IfdType.slong]: {
    size: 4,
    name: "sLong",
    getNumber: (data, index, littleEndian) =>
      data.getInt32(index * 4, littleEndian),
  },
  [IfdType.srational]: {
    size: 8,
    name: "sRational",
    getNumber: (data, index, littleEndian) =>
      data.getInt32(index * 8, littleEndian) /
      data.getInt32(index * 8 + 4, littleEndian),
  },
  [IfdType.float]: {
    size: 4,
    name: "Float",
    getNumber: (data, index, littleEndian) =>
      data.getFloat32(index * 4, littleEndian),
  },
  [IfdType.double]: {
    size: 8,
    name: "Double",
    getNumber: (data, index, littleEndian) =>
      data.getFloat64(index * 8, littleEndian),
  },
};
