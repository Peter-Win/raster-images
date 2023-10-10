import { OldConverter as Converter } from "../../OldConverter";
import { CvtGray8toRGB8 } from "../../../cvt/gray/CvtGray8toRGB8";
import { Cvt24to32AndSwapRB } from "../../../cvt/rgb/Cvt24to32";
import { SimpleRowConverter } from "../../SimpleRowConverter";
import { buildConverterGraph } from "../buildConverterGraph";
import { findPath } from "../findPath";
import { defaultConverterProps } from "../../ConverterProps";
import { CvtGray1toGray8 } from "../../../cvt/gray/CvtGray1toGray";
import { CvtGray1to32 } from "../../../cvt/gray/CvtGray1toRGB";

const cvtStr = (c: Converter | undefined): string =>
  c ? `${c.srcSign} => ${c.dstSign}` : "";

describe("findPath", () => {
  it("one step", () => {
    const list: Converter[] = [
      new SimpleRowConverter("G8", "R8G8B8", CvtGray8toRGB8),
    ];
    const graph = buildConverterGraph(defaultConverterProps, list);
    const p1 = findPath("G8", "R8G8B8", graph);
    expect(p1.length).toBe(1);
    expect(cvtStr(p1[0])).toBe("G8 => R8G8B8");
    expect(findPath("R8G8B8", "G8", graph).length).toBe(0);
    expect(findPath("G8", "B8G8R8", graph).length).toBe(0);
  });

  it("two steps", () => {
    const list: Converter[] = [
      new SimpleRowConverter("R8G8B8", "R8G8B8A8", Cvt24to32AndSwapRB),
      new SimpleRowConverter("G8", "R8G8B8", CvtGray8toRGB8),
    ];
    const graph = buildConverterGraph(defaultConverterProps, list);
    const path = findPath("G8", "R8G8B8A8", graph);
    expect(path.length).toBe(2);
    expect(cvtStr(path[0])).toBe("G8 => R8G8B8");
    expect(cvtStr(path[1])).toBe("R8G8B8 => R8G8B8A8");
  });

  it("three steps", () => {
    const list: Converter[] = [
      new SimpleRowConverter("R8G8B8", "R8G8B8A8", Cvt24to32AndSwapRB),
      new SimpleRowConverter("G8", "R8G8B8", CvtGray8toRGB8),
      new SimpleRowConverter("G1", "G8", CvtGray1toGray8),
    ];
    const graph = buildConverterGraph(defaultConverterProps, list);
    const path = findPath("G1", "R8G8B8A8", graph);
    expect(path.length).toBe(3);
    expect(cvtStr(path[0])).toBe("G1 => G8");
    expect(cvtStr(path[1])).toBe("G8 => R8G8B8");
    expect(cvtStr(path[2])).toBe("R8G8B8 => R8G8B8A8");
  });

  it("optimal path", () => {
    const list: Converter[] = [
      new SimpleRowConverter("R8G8B8", "R8G8B8A8", Cvt24to32AndSwapRB),
      new SimpleRowConverter("G8", "R8G8B8", CvtGray8toRGB8),
      new SimpleRowConverter("G1", "G8", CvtGray1toGray8),
      new SimpleRowConverter("G1", "R8G8B8A8", CvtGray1to32),
    ];
    const graph = buildConverterGraph(defaultConverterProps, list);
    const path = findPath("G1", "R8G8B8A8", graph);
    expect(path.length).toBe(1);
    expect(cvtStr(path[0])).toBe("G1 => R8G8B8A8");
  });
});
