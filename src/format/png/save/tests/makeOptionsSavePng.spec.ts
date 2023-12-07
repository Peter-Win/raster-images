import { PngPackLevelStd, makeOptionsSavePng } from "../OptionsSavePng";

describe("makeOptionsSavePng", () => {
  it("empty", () => {
    expect(makeOptionsSavePng()).toBeUndefined();
    expect(makeOptionsSavePng({})).toEqual({});
  });
  it("modificationTime", () => {
    expect(
      makeOptionsSavePng({
        modificationTime: "2023-12-07 10:48:02",
      })
    ).toEqual({
      modificationTime: new Date(2023, 11, 7, 10, 48, 2),
    });
    expect(
      makeOptionsSavePng({
        modificationTime: "2023-12-07",
      })
    ).toEqual({
      modificationTime: new Date(2023, 11, 7, 0, 0, 0),
    });
  });
  it("packLevel", () => {
    expect(
      makeOptionsSavePng({
        packLevel: PngPackLevelStd.default,
      })
    ).toEqual({
      level: PngPackLevelStd.default,
    });
    expect(
      makeOptionsSavePng({
        packLevel: PngPackLevelStd.bestCompression,
      })
    ).toEqual({
      level: PngPackLevelStd.bestCompression,
    });
  });
});
