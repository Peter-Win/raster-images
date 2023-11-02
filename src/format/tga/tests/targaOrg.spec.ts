import { orgAndSizeToTarga, orgFromTarga } from "../targaOrg";
import { Point } from "../../../math";

test("orgFromTarga", () => {
  expect(
    orgFromTarga(
      {
        width: 44,
        height: 33,
        x0: 0,
        y0: 0,
      },
      { top2bottom: false, right2left: false }
    )
  ).toEqual({
    orgX: 0,
    orgY: 0,
  });
  expect(
    orgFromTarga(
      {
        width: 44,
        height: 33,
        x0: 0,
        y0: 33,
      },
      { top2bottom: true, right2left: false }
    )
  ).toEqual({
    orgX: 0,
    orgY: 0,
  });
  expect(
    orgFromTarga(
      {
        width: 44,
        height: 33,
        x0: 44,
        y0: 0,
      },
      { top2bottom: false, right2left: true }
    )
  ).toEqual({
    orgX: 0,
    orgY: 0,
  });
});

test("orgAndSizeToTarga", () => {
  const size = new Point(44, 33);
  expect(orgAndSizeToTarga(size, {})).toEqual({
    x0: 0,
    y0: 0,
    width: 44,
    height: 33,
  });
  expect(orgAndSizeToTarga(size, { top2bottom: true })).toEqual({
    x0: 0,
    y0: 33,
    width: 44,
    height: 33,
  });
  expect(orgAndSizeToTarga(size, { right2left: true })).toEqual({
    x0: 44,
    y0: 0,
    width: 44,
    height: 33,
  });
});
