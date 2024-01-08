import { IfdEntry, getIfdDataSize } from "../IfdEntry";
import { IfdType } from "../IfdType";

const mkIfd = (type: IfdType, count: number): IfdEntry => ({
  tagId: 0,
  type,
  count,
  valueOffset: new DataView(new ArrayBuffer(4)),
});

test("getIfdDataSize", () => {
  expect(getIfdDataSize(mkIfd(IfdType.byte, 5))).toBe(5);
  expect(getIfdDataSize(mkIfd(IfdType.ascii, 13))).toBe(13);
  expect(getIfdDataSize(mkIfd(IfdType.short, 7))).toBe(14);
  expect(getIfdDataSize(mkIfd(IfdType.long, 9))).toBe(36);
  expect(getIfdDataSize(mkIfd(IfdType.rational, 3))).toBe(24);
  expect(getIfdDataSize(mkIfd(IfdType.sbyte, 17))).toBe(17);
  expect(getIfdDataSize(mkIfd(IfdType.undefined, 19))).toBe(19);
  expect(getIfdDataSize(mkIfd(IfdType.sshort, 13))).toBe(26);
  expect(getIfdDataSize(mkIfd(IfdType.slong, 2))).toBe(8);
  expect(getIfdDataSize(mkIfd(IfdType.srational, 4))).toBe(32);
  expect(getIfdDataSize(mkIfd(IfdType.float, 5))).toBe(20);
  expect(getIfdDataSize(mkIfd(IfdType.double, 6))).toBe(48);
});
