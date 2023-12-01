import { PixelDepth } from "../../types";
import { Converter, readImage } from "../../Converter";
import { ImageInfo } from "../../ImageInfo";
import { BitmapFormat, BitmapFrame } from "../BitmapFormat";
import { LayersMixer } from "./LayersMixer";
import { PsdCompression } from "./PsdCompression";
import { LayerRecord } from "./psdLayerInfo";
import { readWordBE } from "../../stream";
import { ColorModel } from "../../ColorModel";
import { ErrorRI } from "../../utils";
import { SampleSign } from "../../Sample";

export class FramePsdLayer implements BitmapFrame {
  readonly type = "layer";

  constructor(
    public format: BitmapFormat,
    public info: ImageInfo,
    public layer: LayerRecord
  ) {}

  get offset(): number {
    return this.layer.offset;
  }

  get size(): number {
    return this.layer.size;
  }

  async read(converter: Converter): Promise<void> {
    const { stream } = this.format;
    const { info, layer } = this;
    const { fmt: colorFmt } = info;
    const idsMap = layerIdsMap[colorFmt.colorModel];
    if (!idsMap) {
      throw new ErrorRI("Can't map layer's for <m> model", {
        m: colorFmt.colorModel,
      });
    }
    await stream.seek(this.offset);
    const depth = (info.fmt.depth / colorFmt.samples.length) as PixelDepth;
    const mixer = new LayersMixer(info.size, depth);
    // Example: {A:-1, R:0, G:1, B:2}
    const colorsOrder: Partial<Record<SampleSign, number>> = {};
    for (const { channelId, dataSize } of layer.channels) {
      const layerIndex = mixer.layers.length;
      const colorId = idsMap[channelId];
      if (colorId) colorsOrder[colorId] = layerIndex;
      const nextPos = (await stream.getPos()) + dataSize;
      const compression = (await readWordBE(stream)) as PsdCompression;
      await mixer.loadLayer(compression, stream, dataSize);
      await stream.seek(nextPos);
    }
    const layersOrder: number[] = colorFmt.samples.map(({ sign }) => {
      const index = colorsOrder[sign];
      if (typeof index !== "number") {
        throw new ErrorRI("Uexpected channels <list> for layer <name>", {
          list: JSON.stringify(
            layer.channels.map(({ channelId }) => channelId)
          ),
          name: layer.layerName,
        });
      }
      return index;
    });
    const fillRow = mixer.getFillRow(layersOrder);
    await readImage(converter, info, fillRow);
  }
}

const layerIdsMap: Partial<Record<ColorModel, Record<number, SampleSign>>> = {
  Gray: {
    [-1]: "A",
    0: "G",
  },
  RGB: {
    [-1]: "A",
    0: "R",
    1: "G",
    2: "B",
  },
  CMYK: {
    [-1]: "A",
    0: "C",
    1: "M",
    2: "Y",
    3: "K",
  },
};
