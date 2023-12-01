import { RAStream } from "../../../stream";
import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { PsdColorMode, readPsdFileHeader } from "../PsdFileHeader";
import { makePsdLayerInfo } from "../makePsdInfo";
import { LayerRecord, readPsdLayersSection } from "../psdLayerInfo";
import { readPsdSection } from "../psdSection";
import { readPsdResources } from "../resources/PsdResources";

const load = async (stream: RAStream) => {
  const header = await readPsdFileHeader(stream);
  await readPsdSection(stream, 0, async () => {});
  await readPsdSection(stream, 0, async ({ size }) => {
    await readPsdResources(stream, size);
  });
  const layers = await readPsdLayersSection(stream);
  return { header, layers };
};

const getChannelIds = (layer: LayerRecord): number[] =>
  layer.channels.map(({ channelId }) => channelId);

describe("makePsdLayerInfo", () => {
  it("Bitmap", async () => {
    await onStreamFromGallery("psd/Bitmap.psd", async (stream) => {
      const { layers } = await load(stream);
      // Duotone have no any channels
      expect(layers.length).toBe(0);
    });
  });
  it("Indexed", async () => {
    await onStreamFromGallery("psd/I8.psd", async (stream) => {
      const { header, layers } = await load(stream);
      expect(header.colorMode).toBe(PsdColorMode.Indexed);
      // Indexed have no any channels
      expect(layers.length).toBe(0);
    });
  });

  it("Grayscale 8", async () => {
    await onStreamFromGallery("psd/G8x.psd", async (stream) => {
      const { header, layers } = await load(stream);
      expect(layers.length).toBe(6);
      // 0
      {
        const layer0 = layers[0]!;
        expect(layer0.layerName).toBe("Background");
        expect(getChannelIds(layer0)).toEqual([0]);
        const info0 = makePsdLayerInfo(header, layer0);
        expect(info0.vars).toEqual({
          orgX: 0,
          orgY: 0,
          name: "Background",
          compression: "RLE",
          blendModeKey: "norm",
          blendModeName: "normal",
          clbl: 1,
          infx: 0,
          knko: 0,
          lclr: [0, 0],
          lspf: 5,
          lyid: 1,
        });
        expect(info0.size.toString()).toBe("(133, 70)");
        expect(info0.fmt.signature).toBe("G8");
      }
      // 1
      {
        const layer1 = layers[1]!;
        expect(layer1.layerName).toBe("Gradient");
        expect(getChannelIds(layer1)).toEqual([-1, 0]);
        const info1 = makePsdLayerInfo(header, layer1);
        expect(info1.vars).toEqual({
          orgX: 0,
          orgY: 0,
          name: "Gradient",
          compression: "RLE",
          blendModeKey: "norm",
          blendModeName: "normal",
          clbl: 1,
          infx: 0,
          knko: 0,
          lclr: [0, 0],
          lspf: 0,
          lyid: 3,
        });
        expect(info1.size.toString()).toBe("(133, 70)");
        expect(info1.fmt.signature).toBe("G8A8");
      }
      // 2
      {
        const layer2 = layers[2]!;
        expect(layer2.layerName).toBe("XXX");
        expect(getChannelIds(layer2)).toEqual([-1, 0]);
        const info2 = makePsdLayerInfo(header, layer2);
        expect(info2.vars).toEqual({
          orgX: 9,
          orgY: 48,
          name: "XXX",
          compression: "RLE",
          blendModeKey: "norm",
          blendModeName: "normal",
          clbl: 1,
          infx: 0,
          knko: 0,
          lclr: [0, 0],
          lspf: 0,
          lyid: 7,
        });
        expect(info2.size.toString()).toBe("(24, 12)");
        expect(info2.fmt.signature).toBe("G8A8");
      }
      // 3
      {
        const layer3 = layers[3]!;
        expect(layer3.layerName).toBe("Mask demo");
        expect(getChannelIds(layer3)).toEqual([-1, 0, -2]);
        const info3 = makePsdLayerInfo(header, layer3);
        expect(info3.vars).toEqual({
          orgX: 23,
          orgY: 10,
          name: "Mask demo",
          compression: "RLE",
          blendModeKey: "norm",
          blendModeName: "normal",
          clbl: 1,
          infx: 0,
          knko: 0,
          lclr: [0, 0],
          lspf: 0,
          lyid: 6,
        });
        expect(info3.size.toString()).toBe("(77, 60)");
        expect(info3.fmt.signature).toBe("G8A8");
      }
    });
  });

  it("Grayscale 16", async () => {
    await onStreamFromGallery("psd/G16x.psd", async (stream) => {
      const { header, layers } = await load(stream);
      expect(layers.length).toBe(6);
      {
        const layer0 = layers[0]!;
        expect(layer0.layerName).toBe("Background");
        expect(getChannelIds(layer0)).toEqual([0]);
        const info0 = makePsdLayerInfo(header, layer0);
        expect(info0.fmt.signature).toBe("G16");
        expect(info0.size.toString()).toBe("(499, 270)");
        expect(info0.vars).toEqual({
          orgX: 0,
          orgY: 0,
          name: "Background",
          compression: "ZIP with prediction",
          blendModeKey: "norm",
          blendModeName: "normal",
          clbl: 1,
          infx: 0,
          knko: 0,
          lclr: [0, 0],
          lspf: 5,
          lyid: 1,
        });
      }
      {
        const layer1 = layers[1]!;
        expect(layer1.layerName).toBe("Naso");
        expect(getChannelIds(layer1)).toEqual([-1, 0, -2]);
        const info1 = makePsdLayerInfo(header, layer1);
        expect(info1.fmt.signature).toBe("G16A16");
      }
    });
  });

  it("Grayscale 32", async () => {
    await onStreamFromGallery("psd/G32x.psd", async (stream) => {
      const { header, layers } = await load(stream);
      expect(layers.length).toBe(6);
      {
        const layer0 = layers[0]!;
        expect(layer0.layerName).toBe("Background");
        expect(getChannelIds(layer0)).toEqual([0]);
        const info0 = makePsdLayerInfo(header, layer0);
        expect(info0.fmt.signature).toBe("G32");
      }
      {
        const layer1 = layers[1]!;
        expect(layer1.layerName).toBe("Naso");
        expect(getChannelIds(layer1)).toEqual([-1, 0, -2]);
        const info1 = makePsdLayerInfo(header, layer1);
        expect(info1.fmt.signature).toBe("G32A32");
      }
    });
  });

  it("RGB", async () => {
    await onStreamFromGallery("psd/RGB_3x16.psd", async (stream) => {
      const { header, layers } = await load(stream);
      expect(layers.length).toBe(6);
      {
        const layer0 = layers[0]!;
        expect(layer0.layerName).toBe("Background");
        expect(getChannelIds(layer0)).toEqual([0, 1, 2]);
        const info0 = makePsdLayerInfo(header, layer0);
        expect(info0.fmt.signature).toBe("R16G16B16");
      }
      {
        const layer2 = layers[2]!;
        expect(layer2.layerName).toBe("Red");
        expect(getChannelIds(layer2)).toEqual([-1, 0, 1, 2]);
        const info0 = makePsdLayerInfo(header, layer2);
        expect(info0.fmt.signature).toBe("R16G16B16A16");
      }
    });
  });

  it("CMYK", async () => {
    await onStreamFromGallery("psd/cmyk2.psd", async (stream) => {
      const { header, layers } = await load(stream);
      expect(layers.length).toBe(6);
      {
        const layer0 = layers[0]!;
        expect(layer0.layerName).toBe("Фон");
        expect(getChannelIds(layer0)).toEqual([0, 1, 2, 3]);
        const info0 = makePsdLayerInfo(header, layer0);
        expect(info0.fmt.signature).toBe("C8M8Y8K8");
      }
      {
        const layer2 = layers[2]!;
        expect(layer2.layerName).toBe("magenta");
        expect(getChannelIds(layer2)).toEqual([-1, 0, 1, 2, 3]);
        const info0 = makePsdLayerInfo(header, layer2);
        expect(info0.fmt.signature).toBe("C8M8Y8K8A8");
      }
    });
  });
});
