import { buildConverterGraph } from "../buildConverterGraph";
import { findPath, findPathEx } from "../findPath";
import { ConverterFactoryDescr } from "../../ConverterFactory";
import { rowsConverter } from "../../converters/rowsConverter";
import { gray8toRgb8 } from "../../rowOps/gray/gray8toRgb8";
import { defaultConverterSearchProps } from "../ConverterSearchProps";
import { rgb24toRgba32 } from "../../rowOps/rgb/rgb24toRgba32";
import { gray1toGray8 } from "../../rowOps/gray/gray1toGray";
import { gray1toRgba32 } from "../../rowOps/gray/gray1toRgb";
import { gray8toGray1Fast } from "../../rowOps/gray/gray8toGray1";
import { factoryQuant2 } from "../../factories";

const cvtStr = (c: ConverterFactoryDescr | undefined): string =>
  c ? `${c.srcSign} => ${c.dstSign}` : "";

const factory = (
  srcSign: string,
  dstSign: string,
  rowsOp: (width: number, src: Uint8Array, dst: Uint8Array) => void
): ConverterFactoryDescr => ({
  srcSign,
  dstSign,
  props: { loss: false, speed: 100, quality: 100 },
  create: (params) =>
    rowsConverter({
      ...params,
      makeRowCvt: (width) => (src, dst) => rowsOp(width, src, dst),
    }),
});

describe("findPath", () => {
  it("one step", () => {
    const list: ConverterFactoryDescr[] = [
      {
        srcSign: "G8",
        dstSign: "R8G8B8",
        props: { loss: false, speed: 100, quality: 100 },
        create: (params) =>
          rowsConverter({
            ...params,
            makeRowCvt: (width) => (src, dst) => gray8toRgb8(width, src, dst),
          }),
      },
    ];
    const graph = buildConverterGraph(defaultConverterSearchProps, list);
    const p1 = findPathEx("G8", "R8G8B8", graph);
    expect(p1.length).toBe(1);
    expect(cvtStr(p1[0])).toBe("G8 => R8G8B8");
    expect(findPath("R8G8B8", "G8", graph)).toBeUndefined();
    expect(() => findPathEx("R8G8B8", "G8", graph)).toThrowError(
      "Can't find converter from R8G8B8 to G8"
    );
    expect(() => findPathEx("G8", "B8G8R8", graph)).toThrowError(
      "Can't find converter from G8 to B8G8R8"
    );
  });

  it("two steps", () => {
    const list: ConverterFactoryDescr[] = [
      factory("R8G8B8", "R8G8B8A8", rgb24toRgba32),
      factory("G8", "R8G8B8", gray8toRgb8),
    ];
    const graph = buildConverterGraph(defaultConverterSearchProps, list);
    const path = findPathEx("G8", "R8G8B8A8", graph);
    expect(path.length).toBe(2);
    expect(cvtStr(path[0])).toBe("G8 => R8G8B8");
    expect(cvtStr(path[1])).toBe("R8G8B8 => R8G8B8A8");
  });

  it("three steps", () => {
    const list: ConverterFactoryDescr[] = [
      factory("R8G8B8", "R8G8B8A8", rgb24toRgba32),
      factory("G8", "R8G8B8", gray8toRgb8),
      factory("G1", "G8", gray1toGray8),
    ];
    const graph = buildConverterGraph(defaultConverterSearchProps, list);
    const path = findPathEx("G1", "R8G8B8A8", graph);
    expect(path.length).toBe(3);
    expect(cvtStr(path[0])).toBe("G1 => G8");
    expect(cvtStr(path[1])).toBe("G8 => R8G8B8");
    expect(cvtStr(path[2])).toBe("R8G8B8 => R8G8B8A8");
  });

  it("optimal path", () => {
    const list: ConverterFactoryDescr[] = [
      factory("R8G8B8", "R8G8B8A8", rgb24toRgba32),
      factory("G8", "R8G8B8", gray8toRgb8),
      factory("G1", "G8", gray1toGray8),
      factory("G1", "R8G8B8A8", gray1toRgba32),
    ];
    const graph = buildConverterGraph(defaultConverterSearchProps, list);
    const path = findPathEx("G1", "R8G8B8A8", graph);
    expect(path.length).toBe(1);
    expect(cvtStr(path[0])).toBe("G1 => R8G8B8A8");
  });

  it("dithering flag", () => {
    const list: ConverterFactoryDescr[] = [
      factoryQuant2({ dithering: true }, "dither"),
      factoryQuant2({ dithering: false }, "nodither"),
    ];
    const graph = buildConverterGraph(
      { dithering: false, prefer: "quality" },
      list
    );
    const path = findPathEx("B8G8R8", "I8", graph);
    expect(path.length).toBe(1);
    expect(path[0]!.label).toBe("nodither");
  });

  // Нужна переделка алгоритма поиска. Пока отложено.
  xit("quality path", () => {
    //  +----> RGB ---+   good path
    //  |             v
    //  G8           RGBA
    //  |             ^
    //  +----> G1 ----+   bad path
    const list: ConverterFactoryDescr[] = [
      factory("G1", "R8G8B8A8", gray1toRgba32),
      factory("G8", "G1", gray8toGray1Fast),
      factory("G8", "R8G8B8", gray8toRgb8),
      factory("R8G8B8", "R8G8B8A8", rgb24toRgba32),
    ];
    const graph = buildConverterGraph(defaultConverterSearchProps, list);
    const path = findPathEx("G8", "R8G8B8A8", graph);
    expect(path.map(cvtStr).join(", ")).toBe(
      "G8 => R8G8B8, R8G8B8 => R8G8B8A8"
    );
  });
});
