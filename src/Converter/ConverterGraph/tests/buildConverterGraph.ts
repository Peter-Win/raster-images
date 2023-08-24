import { defaultConverterProps } from "../../ConverterProps";
import { CvtGray8toRGB8 } from "../../../cvt/gray/CvtGray8toRGB8";
import { Converter } from "../../Converter";
import { SimpleRowConverter } from "../../SimpleRowConverter";
import { buildConverterGraph } from "../buildConverterGraph";

describe("buildConverterGraph", () => {
  it("simple case", () => {
    const list: Converter[] = [
      new SimpleRowConverter("G8", "R8G8B8", CvtGray8toRGB8),
    ];
    const graph = buildConverterGraph(defaultConverterProps, list);
    expect(Object.values(graph).length).toBe(1);
    expect(graph.G8).toBeDefined();
  });
});
