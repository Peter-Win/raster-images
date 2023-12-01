import {
  PsdResolutionInfo,
  PsdResolutionUnit,
  PsdSizeUnit,
  getResolutionVars,
} from "../ResolutionInfo";

describe("getResolutionVars", () => {
  it("inches", () => {
    const resInfo: PsdResolutionInfo = {
      hRes: 1,
      hResUnit: PsdResolutionUnit.inches,
      widthUnit: PsdSizeUnit.inches,
      vRes: 72,
      vResUnit: PsdResolutionUnit.inches,
      heightUnit: PsdSizeUnit.inches,
    };
    // 1 meter = 39,3701 inches
    // 1 pixel/inch = 39,7101 pixels per meter
    const vars = getResolutionVars(resInfo);
    expect(vars.resX).toBeCloseTo(39.37);
    expect(vars.resY).toBeCloseTo(2834.65);
    expect(vars.resUnit).toBe("inch");
  });
  it("cm", () => {
    const resInfo: PsdResolutionInfo = {
      hRes: 1,
      hResUnit: PsdResolutionUnit.cm,
      widthUnit: PsdSizeUnit.cm,
      vRes: 10,
      vResUnit: PsdResolutionUnit.cm,
      heightUnit: PsdSizeUnit.cm,
    };
    // 1 pixel per cm ==> 100 pixel per meter
    // 1 pixel/inch = 39,7101 pixels per meter
    const vars = getResolutionVars(resInfo);
    expect(vars.resX).toBeCloseTo(100);
    expect(vars.resY).toBeCloseTo(1000);
    expect(vars.resUnit).toBe("cm");
  });
  it("mixed", () => {
    const resInfo: PsdResolutionInfo = {
      hRes: 1,
      hResUnit: PsdResolutionUnit.inches,
      widthUnit: PsdSizeUnit.inches,
      vRes: 1,
      vResUnit: PsdResolutionUnit.cm,
      heightUnit: PsdSizeUnit.cm,
    };
    const vars = getResolutionVars(resInfo);
    expect(vars.resX).toBeCloseTo(39.37);
    expect(vars.resUnitX).toBe("inch");
    expect(vars.resY).toBeCloseTo(100);
    expect(vars.resUnitY).toBe("cm");
  });
});
