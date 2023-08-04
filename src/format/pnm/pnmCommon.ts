export const pnmName = "Portable anymap format";

export type PnmDataType = "plain" | "raw";
export type PnmMapFormat = "bitmap" | "graymap" | "pixmap";

export type PnmDescriptor = {
  sign: string;
  type: PnmDataType;
  fmt: PnmMapFormat;
};

export const pnmDescriptions: PnmDescriptor[] = [
  { sign: "P1", type: "plain", fmt: "bitmap" },
  { sign: "P2", type: "plain", fmt: "graymap" },
  { sign: "P3", type: "plain", fmt: "pixmap" },
  { sign: "P4", type: "raw", fmt: "bitmap" },
  { sign: "P5", type: "raw", fmt: "graymap" },
  { sign: "P6", type: "raw", fmt: "pixmap" },
];
