import { PaletteItem } from "../../../Palette";
import { Rational } from "../../../math";

export const enum ExtAreaSizes {
  authorName = 41,
  authorComment = 324,
  authorCommentLine = 81, // authorComment =  4 * authorCommentLine
  jobName = 41,
  softwareID = 41,
}

export const enum AttributesType {
  noAlpha = 0,
  canBeIgnored = 1,
  shouldBeRetained = 2,
  usefulAlpha = 3,
  preMultipliedAlpha = 4,
}

export interface TargaExtensionArea {
  authorName: string;
  authorComment: string[];
  dateTime?: Date;
  jobName: string;
  jobTimeInSeconds: number;
  softwareID: string;
  softwareVersion: string; // example: 1.17b
  keyColor: PaletteItem;
  aspectRatio: Rational;
  gamma: Rational;
  colorCorrectionOffset: number; // 0 if not used
  postageStampOffset: number; // 0 if not used
  scanLineOffset: number; //
  attributesType: AttributesType;
}
