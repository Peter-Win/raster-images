import { RAStream } from "../../../stream";
import {
  FieldsBlock,
  fieldInt16,
  fieldLong,
  fieldsBlockSize,
  readFieldsBlock,
} from "../../FieldsBlock";
import { PsdResourceDef } from "./PsdResources";
import { ErrorRI } from "../../../utils";
import { Variables } from "../../../ImageInfo/Variables";
import {
  ResolutionUnit,
  resolutionToMeters,
} from "../../../ImageInfo/resolution";

/**
 * @see https://usermanual.wiki/Document/Photoshop20API20Guide.1445764450/html
 * Table A-6: ResolutionInfo structure
 * Type    Field      Description
 * -----   ---------  ------------
 * Fixed   hRes       Horizontal resolution in pixels per inch.
 * int16   hResUnit   1=display horitzontal resolution in pixels per inch; 2=dis-play horitzontal resolution in pixels per cm.
 * int16   widthUnit  Display width as 1=inches; 2=cm; 3=points; 4=picas; 5=col-umns.
 * Fixed   vRes       Vertial resolution in pixels per inch.
 * int16   vResUnit   1=display vertical resolution in pixels per inch; 2=display vertical resolution in pixels per cm.
 * int16   heightUnit Display height as 1=inches; 2=cm; 3=points; 4=picas; 5=col-umns.
 */

export enum PsdResolutionUnit {
  inches = 1,
  cm = 2,
}

export const enum PsdSizeUnit {
  inches = 1,
  cm = 2,
  points = 3,
  picas = 4,
  columns = 5,
}

export interface PsdResolutionInfo {
  hRes: number;
  hResUnit: PsdResolutionUnit;
  widthUnit: PsdSizeUnit;
  vRes: number;
  vResUnit: PsdResolutionUnit;
  heightUnit: PsdSizeUnit;
}

const descrResolutionInfo: FieldsBlock<PsdResolutionInfo> = {
  littleEndian: false,
  fields: [
    fieldLong("hRes"),
    fieldInt16("hResUnit"),
    fieldInt16("widthUnit"),
    fieldLong("vRes"),
    fieldInt16("vResUnit"),
    fieldInt16("heightUnit"),
  ],
};

export const loadResolutionInfo = async (
  stream: RAStream,
  { offset, size }: PsdResourceDef
): Promise<PsdResolutionInfo> => {
  await stream.seek(offset);
  if (size !== fieldsBlockSize(descrResolutionInfo)) {
    throw new ErrorRI("Invalid PSD resolution info");
  }
  const res = await readFieldsBlock(stream, descrResolutionInfo);
  res.hRes *= 1.0 / 0x10000;
  res.vRes *= 1.0 / 0x10000;
  return res;
};

export const getResolutionVars = (resInfo: PsdResolutionInfo): Variables => {
  const vars: Variables = {};
  const psdToStd: Record<PsdResolutionUnit, ResolutionUnit> = {
    [PsdResolutionUnit.inches]: "inch",
    [PsdResolutionUnit.cm]: "cm",
  };
  const hUnitStd = psdToStd[resInfo.hResUnit];
  const vUnitStd = psdToStd[resInfo.vResUnit];
  if (hUnitStd && vUnitStd) {
    vars.resX = resolutionToMeters(resInfo.hRes, hUnitStd);
    vars.resY = resolutionToMeters(resInfo.vRes, vUnitStd);
    if (hUnitStd === vUnitStd) {
      vars.resUnit = hUnitStd;
    } else {
      vars.resUnitX = hUnitStd;
      vars.resUnitY = vUnitStd;
    }
  }
  return vars;
};
