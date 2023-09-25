import { makeAsciiRow } from "../getRowWriter";

describe("makeAsciiRow", () => {
  it("maxLength = 10", () => {
    const bytes = new Uint8Array([251, 252, 253, 254, 12, 255]);
    //
    // 0123456789
    // 251 252*
    // 12 253 254
    // 255*
    expect(makeAsciiRow(bytes, 10).replace(/\n/g, "|")).toBe(
      "251 252|253 254 12|255|"
    );
  });
});
