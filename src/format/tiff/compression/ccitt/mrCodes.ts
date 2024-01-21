export type MRCodeId =
  | "Pass" // Pass over a change
  | "Horiz" // 001 + 2 Huffman codes	This means a white and black Huffman code will follow (Huffman RLE)
  | "V0" // Color change happens the same as the line above
  | "Vr1" // olor change is same as the line above shifted right by 1
  | "Vr2" // Color change is same as the line above shifted right by 2
  | "Vr3" // Color change is same as the line above shifted right by 3
  | "Vl1" // Color change is same as the line above shifted left by 1
  | "Vl2" // Color change is same as the line above shifted left by 2
  | "Vl3" // Color change is same as the line above shifted left by 3
  | "Ext2D" //
  | "Ext1D"; //

export type MRDecodeDict = Record<string, MRCodeId>;
export type MREncodeDict = Record<MRCodeId, string>;

export const mrEncodeDict: MREncodeDict = {
  Pass: "0001",
  Horiz: "001", // + 2 Huffman codes
  V0: "1",
  Vr1: "011",
  Vr2: "000011",
  Vr3: "0000011",
  Vl1: "010",
  Vl2: "000010",
  Vl3: "0000010",
  Ext2D: "0000001",
  Ext1D: "000000001",
};

export const mrDecodeDict: MRDecodeDict = Object.entries(mrEncodeDict).reduce(
  (dict, [id, code]) => ({
    ...dict,
    [code]: id,
  }),
  {}
);
