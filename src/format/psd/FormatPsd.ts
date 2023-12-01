import { RAStream, readWordBE } from "../../stream";
import { Variables } from "../../ImageInfo/Variables";
import { BitmapFormat, BitmapFrame } from "../BitmapFormat";
import { PsdColorMode, readPsdFileHeader } from "./PsdFileHeader";
import { readPsdSection } from "./psdSection";
import { ErrorRI } from "../../utils";
import { readPsdPalette } from "./psdPalette";
import { PsdResources, readPsdResources } from "./resources/PsdResources";
import { readPsdLayersSection } from "./psdLayerInfo";
import { FramePsdLayer } from "./FramePsdLayer";
import { makePsdImageInfo, makePsdLayerInfo } from "./makePsdInfo";
import { FramePsdImage } from "./FramePsdImage";
import { PsdCompression, psdCompressionName } from "./PsdCompression";
import { Palette } from "../../Palette";
import { readDefaultVariables } from "./resources/readDefaultVariables";

export class FormatPsd implements BitmapFormat {
  vars: Variables = {};

  frames: BitmapFrame[] = [];

  layers: FramePsdLayer[] = [];

  resources: PsdResources = {};

  findLayer(name: string): FramePsdLayer | undefined {
    return this.layers.find(({ layer }) => layer.layerName === name);
  }

  get imageFrame(): FramePsdImage {
    const fr = this.frames[0];
    if (!fr || !(fr instanceof FramePsdImage))
      throw new ErrorRI("Image frame not found");
    return fr;
  }

  static async create(stream: RAStream): Promise<FormatPsd> {
    const inst = new FormatPsd(stream);
    let palette: Palette | undefined;
    await stream.seek(0);
    // 1. Header
    const header = await readPsdFileHeader(stream);
    // 2. Color Mode Data Section
    await readPsdSection(stream, 0, async ({ size }) => {
      // Indexed color images: length is 768; color data contains the color table for the image, in non-interleaved order.
      const count = 256;
      const need = 3 * count;
      if (header.colorMode === PsdColorMode.Indexed) {
        if (size !== need)
          throw new ErrorRI(
            "The expected palette size was <need>, but received <size>.",
            {
              need,
              size,
            }
          );
        // palette
        palette = await readPsdPalette(stream, count);
      }
    });

    // 3. Image Resource Blocks
    const resVars: Variables = await readPsdSection(
      stream,
      0,
      async ({ size }) => {
        inst.resources = await readPsdResources(stream, size);
        return readDefaultVariables(stream, inst.resources);
      }
    );

    // 4. Layer and Mask Information Section
    const layersList = await readPsdLayersSection(stream);

    // 5. Image Data Section
    const info = makePsdImageInfo(header);
    info.fmt.setPalette(palette);
    const compressionId = (await readWordBE(stream)) as PsdCompression;
    const vars = info.vars || {};
    vars.compression =
      psdCompressionName[compressionId] || String(compressionId);
    info.vars = { ...vars, ...resVars };
    const imgOffs = await stream.getPos();
    const imgSize = (await stream.getSize()) - imgOffs;
    inst.frames.push(
      new FramePsdImage(inst, info, compressionId, imgOffs, imgSize)
    );

    for (const layer of layersList) {
      const layerInfo = makePsdLayerInfo(header, layer);
      const frame = new FramePsdLayer(inst, layerInfo, layer);
      inst.frames.push(frame);
      inst.layers.push(frame);
    }
    return inst;
  }

  protected constructor(readonly stream: RAStream) {}
}
