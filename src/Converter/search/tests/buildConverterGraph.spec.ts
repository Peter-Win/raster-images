import { defaultConverterSearchProps } from "../ConverterSearchProps";
import { ConverterFactoryDescr } from "../../ConverterFactory";
import { buildConverterGraph } from "../buildConverterGraph";
import { ParamsConverter } from "../../converters/ParamsConverter";
import { rowsConverter } from "../../converters/rowsConverter";
import { SurfaceStd } from "../../../Surface";
import { surfaceConverter } from "../../surfaceConverter";
import { dump } from "../../../utils";

/* eslint no-param-reassign: "off" */

describe("buildConverterGraph", () => {
  it("simple case", async () => {
    const swap24 = (width: number) => (src: Uint8Array, dst: Uint8Array) => {
      let pos = 0;
      const end = width * 3;
      while (pos < end) {
        dst[pos] = src[pos + 2]!;
        dst[pos + 1] = src[pos + 1]!;
        dst[pos + 2] = src[pos]!;
        pos += 3;
      }
    };
    const list: ConverterFactoryDescr[] = [
      {
        srcSign: "R8G8B8",
        dstSign: "B8G8R8",
        props: { loss: false, speed: 100, quality: 100 },
        create: (params: ParamsConverter) =>
          rowsConverter({ ...params, makeRowCvt: swap24 }),
      },
    ];
    const graph = buildConverterGraph(defaultConverterSearchProps, list);
    expect(Object.keys(graph).sort()).toEqual(["B8G8R8", "R8G8B8"]);
    expect(graph.R8G8B8).toBeDefined();
    expect(graph.R8G8B8!.sign).toBe("R8G8B8");
    expect(graph.R8G8B8!.edges.length).toBe(1);
    const { descr } = graph.R8G8B8!.edges[0]!;
    expect(descr.srcSign).toBe("R8G8B8");
    const srcImg = SurfaceStd.createSign(2, 1, descr.srcSign, {
      data: new Uint8Array([1, 2, 3, 4, 5, 6]),
    });
    const nextConverter = surfaceConverter(srcImg);
    const converter = descr.create({
      nextConverter,
      srcSign: descr.srcSign,
      dstSign: descr.dstSign,
      size: srcImg.size,
    });
    const dstImg = await converter.getSurface();
    expect(dstImg.width).toBe(2);
    expect(dstImg.height).toBe(1);
    expect(dump(dstImg.getRowBuffer(0))).toBe("03 02 01 06 05 04");
  });
});
