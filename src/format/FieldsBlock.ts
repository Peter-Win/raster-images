// Эта система необходима, чтобы упорядочить чтение/запись многочисленных заголовков

import { RAStream } from "../stream";

/* eslint no-param-reassign: "off" */

export interface Field<Struct extends {}> {
  size: number;
  key?: keyof Struct;
  fromBuf?: (buf: Uint8Array, offset: number) => Struct[keyof Struct];
  fromDataView?: (
    dv: DataView,
    offset: number,
    littleEndian?: boolean
  ) => Struct[keyof Struct];
  toBuf?: <K extends keyof Struct>(
    value: Struct[K],
    buf: Uint8Array,
    offset: number
  ) => void;
  toDataView?: <K extends keyof Struct>(
    value: Struct[K],
    dv: DataView,
    offset: number,
    littleEndian?: boolean
  ) => void;
  validate?: <K extends keyof Struct>(value: Struct[K]) => void;
  readonly defaultValue?: Struct[keyof Struct];
}

export interface FieldsBlock<Struct extends {}> {
  littleEndian?: boolean;
  fields: Field<Struct>[];
}

export const fieldFourCC = <Struct extends {}>(
  key: keyof Struct
): Field<Struct> => ({
  key,
  size: 4,
  fromBuf: (buf: Uint8Array, offset: number) => {
    let res = "";
    for (let i = 0; i < 4; i++) res += String.fromCharCode(buf[offset + i]!);
    return res as Struct[keyof Struct];
  },
  toBuf: (value: Struct[keyof Struct], buf: Uint8Array, offset: number) => {
    if (typeof value === "string") {
      Array.from(value as string).forEach((c, i) => {
        buf[i + offset] = c.charCodeAt(0);
      });
    } else throw Error("Expected string");
  },
});

export const fieldByte = <Struct extends {}, K extends keyof Struct>(
  key: K
): Field<Struct> => ({
  key,
  size: 1,
  fromBuf: (buf: Uint8Array, offset: number) => buf[offset]! as Struct[K],
  toBuf: (value, buf, offset) => {
    if (typeof value === "number") {
      buf[offset] = value;
    } else throw Error("Expected number");
  },
});

export const fieldWord = <Struct extends {}>(
  key: keyof Struct
): Field<Struct> => ({
  key,
  size: 2,
  fromDataView: (dv, offset, littleEndian): Struct[keyof Struct] =>
    dv.getUint16(offset, littleEndian) as Struct[keyof Struct],
  toDataView: (value, dv, offset, littleEndian) => {
    if (typeof value === "number") {
      dv.setUint16(offset, value, littleEndian);
    } else throw Error("Expected number");
  },
});

export const fieldDword = <Struct extends {}>(
  key: keyof Struct
): Field<Struct> => ({
  key,
  size: 4,
  fromDataView: (dv, offset, littleEndian) =>
    dv.getUint32(offset, littleEndian) as Struct[keyof Struct],
  toDataView: (value, dv, offset, littleEndian) => {
    if (typeof value === "number") {
      dv.setUint32(offset, value, littleEndian);
    } else throw Error("Expected number");
  },
});

export const fieldLong = <Struct extends {}>(
  key: keyof Struct
): Field<Struct> => ({
  key,
  size: 4,
  fromDataView: (dv, offset, littleEndian) =>
    dv.getInt32(offset, littleEndian) as Struct[keyof Struct],
  toDataView: (value, dv, offset, littleEndian) => {
    if (typeof value === "number") {
      dv.setInt32(offset, value, littleEndian);
    } else throw Error("Expected number");
  },
});

export const fieldsBlockSize = ({
  fields,
}: {
  fields: { size: number }[];
}): number => fields.reduce((sum, { size }) => sum + size, 0);

export const readFieldsBlockFromBuffer = <Struct extends {}>(
  buffer: Uint8Array,
  block: FieldsBlock<Struct>
): Struct => {
  const dataView = new DataView(buffer.buffer, buffer.byteOffset);
  const result = {} as Struct;
  let offset = 0;
  block.fields.forEach(({ size, key, fromBuf, fromDataView, validate }) => {
    if (key) {
      if (fromBuf) {
        result[key] = fromBuf(buffer, offset);
      } else if (fromDataView) {
        result[key] = fromDataView(dataView, offset, block.littleEndian);
      } else throw Error(`Undefined reading method for ${String(key)}`);
      validate?.(result[key]);
    }
    offset += size;
  });
  return result;
};

export const readFieldsBlock = async <Struct extends {}>(
  stream: RAStream,
  block: FieldsBlock<Struct>
): Promise<Struct> => {
  const blockSize = fieldsBlockSize(block);
  const buffer = await stream.read(blockSize);
  return readFieldsBlockFromBuffer(buffer, block);
};

export const writeFieldsBlock = async <Struct extends {}>(
  struct: Struct,
  stream: RAStream,
  block: FieldsBlock<Struct>
): Promise<void> => {
  const blockSize = fieldsBlockSize(block);
  const buffer = new Uint8Array(blockSize);
  const dataView = new DataView(buffer.buffer, buffer.byteOffset);
  let offset = 0;
  block.fields.forEach(
    ({ size, key, toBuf, toDataView, validate, defaultValue }) => {
      if (key) {
        const value = struct[key] ?? defaultValue!;
        validate?.(value);
        if (value !== undefined) {
          if (toBuf) toBuf(value, buffer, offset);
          else if (toDataView)
            toDataView(value, dataView, offset, block.littleEndian);
          else throw Error(`Undefined writing method for ${String(key)}`);
        }
      }
      offset += size;
    }
  );
  await stream.write(buffer);
};
