import { reverseRow } from "../reverseRow";
import { dump } from "../../../utils";

describe("reverseRow", () => {
  it("odd 1", () => {
    const row = new Uint8Array([1, 2, 3, 4, 5]);
    reverseRow(5, row, 1);
    expect(dump(row)).toBe("05 04 03 02 01");
  });
  it("even 1", () => {
    const row = new Uint8Array([1, 2, 3, 4]);
    reverseRow(4, row, 1);
    expect(dump(row)).toBe("04 03 02 01");
  });
  it("odd 2", () => {
    const row = new Uint8Array([1, 2, 3, 4, 5, 6]);
    reverseRow(3, row, 2);
    expect(dump(row)).toBe("05 06 03 04 01 02");
  });
  it("even 2", () => {
    const row = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    reverseRow(4, row, 2);
    expect(dump(row)).toBe("07 08 05 06 03 04 01 02");
  });
  it("odd 3", () => {
    const row = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    reverseRow(3, row, 3);
    expect(dump(row)).toBe("07 08 09 04 05 06 01 02 03");
  });
  it("even 3", () => {
    const row = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    reverseRow(4, row, 3);
    expect(dump(row)).toBe("0A 0B 0C 07 08 09 04 05 06 01 02 03");
  });
});
