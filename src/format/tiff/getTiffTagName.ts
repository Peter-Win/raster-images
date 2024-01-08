import { TiffTag, tiffTagName } from "./TiffTag";

export const getTiffTagName = (tagId: number): string =>
  tiffTagName[tagId as TiffTag] ??
  tagId.toString(16).toUpperCase().padStart(4, "0");
