import { targaOptionsFromVars, targaOptionsToVars } from "../OptionsTarga";

test("targaOptionsToVars", () => {
  expect(targaOptionsToVars({})).toEqual({ rowsOrder: "backward" });
  expect(
    targaOptionsToVars({
      compression: true,
      top2bottom: true,
      right2left: true,
      orgX: 2,
      orgY: 3,
    })
  ).toEqual({
    compression: "RLE",
    rowsOrder: "forward",
    rightToLeft: 1,
    orgX: 2,
    orgY: 3,
  });
});

test("targaOptionsFromVars", () => {
  expect(targaOptionsFromVars({})).toEqual({});
  expect(
    targaOptionsFromVars({
      compression: "None",
      rowsOrder: "backward",
      right2left: 0,
      orgX: 0,
      orgY: 0,
    })
  ).toEqual({});
  expect(
    targaOptionsFromVars({
      compression: "RLE",
      rowsOrder: "forward",
      rightToLeft: 1,
      orgX: 2,
      orgY: 3,
    })
  ).toEqual({
    compression: true,
    top2bottom: true,
    right2left: true,
    orgX: 2,
    orgY: 3,
  });
});
