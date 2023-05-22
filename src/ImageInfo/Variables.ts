export type VarName =
  | "comment"
  | "compression" // None, RLE8, LZW ...
  | "bgColor" // special pixel value for background color
  | "ext" // extension: bmp, tga, jpg...
  | "importantColors" // important colors in palette
  | "orgX" // x of original position
  | "orgY"
  | "resUnit" // resolution units: meter, inch, cm, mm, unknown (for aspect X/Y definition only)
  | "resX" // x-resolution (pixels/resUnit)
  | "resY"
  | "transparency"; // special pixel value for transparent color

export type VarValue = string | number | string[] | number[];

export type Variables = Record<VarName | string, VarValue>;

export const copyVars = (src: Variables): Variables => {
  const dst: Variables = {};
  Object.entries(src).forEach(([key, value]) => {
    dst[key] = cloneVarValue(value);
  });
  return dst;
};

export const cloneVarValue = (value: VarValue): VarValue =>
  Array.isArray(value) ? ([...value] as VarValue) : value;

export const getVarNumber = (v: VarValue | undefined, defaultValue: number) => {
  if (typeof v === "number") {
    return v;
  }
  if (typeof v === "string") {
    const n = +v;
    if (!Number.isNaN(n)) return n;
  }
  return defaultValue;
};
