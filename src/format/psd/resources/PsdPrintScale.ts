import { RAStream } from "../../../stream";
import {
  FieldsBlock,
  fieldFloat32,
  fieldWord,
  fieldsBlockSize,
  readFieldsBlock,
} from "../../FieldsBlock";
import { PsdResourceDef } from "./PsdResources";

/**
 * PsdResId.printScale = 0x0426
 * (Photoshop 7.0) Print scale.
 * 2 bytes style (0 = centered, 1 = size to fit, 2 = user defined).
 * 4 bytes x location (floating point).
 * 4 bytes y location (floating point).
 * 4 bytes scale (floating point)
 */
export const enum PsdPrintScaleStyle {
  centered = 0,
  sizeToFit = 1,
  userDefined = 2,
}
export interface PsdPrintScale {
  style: PsdPrintScaleStyle;
  xLocation: number;
  yLocation: number;
  scale: number;
}

const descr: FieldsBlock<PsdPrintScale> = {
  littleEndian: false,
  fields: [
    fieldWord("style"),
    fieldFloat32("xLocation"),
    fieldFloat32("yLocation"),
    fieldFloat32("scale"),
  ],
};

export const loadPsdPrintScale = async (
  stream: RAStream,
  { offset, size }: PsdResourceDef
): Promise<PsdPrintScale | undefined> => {
  const needSize = fieldsBlockSize(descr);
  await stream.seek(offset);
  if (size !== needSize) return undefined;
  return readFieldsBlock(stream, descr);
};
