import { RAStream, streamLock } from "../../stream";
import { Converter, readImage } from "../../Converter";
import { ImageInfo } from "../../ImageInfo";
import { BitmapFormat, BitmapFrame } from "../BitmapFormat";
import { PsdCompression } from "./PsdCompression";
import { createPsdReader } from "./readPsdImageData";
import { LayersMixer } from "./LayersMixer";
import { PixelDepth } from "../../types";

export class FramePsdImage implements BitmapFrame {
  readonly type = "image";

  constructor(
    public format: BitmapFormat,
    public info: ImageInfo,
    public compression: PsdCompression,
    public offset: number,
    public size: number
  ) {}

  async read(converter: Converter): Promise<void> {
    await streamLock(this.format.stream, async (stream: RAStream) => {
      await stream.seek(this.offset);
      const layersCount = this.info.fmt.samples.length;

      if (layersCount === 1) {
        // Для форматов с одним каналом (Duotone, Indexed, Grayscale) можно читать сразу в целевую поверхность.
        const reader = createPsdReader(this.compression);
        const fillRow = await reader(
          stream,
          this.info.size,
          this.info.fmt.depth
        );
        await readImage(converter, this.info, fillRow);
      } else {
        const mixer = new LayersMixer(
          this.info.size,
          (this.info.fmt.depth / layersCount) as PixelDepth
        );
        await mixer.loadSimilarLayers(layersCount, this.compression, stream);
        // Здесь предполагается, что порядок следования слоёв совпадает с описанием цветовых компонентов.
        const fillRow = mixer.getFillRow(
          this.info.fmt.samples.map((_, i) => i)
        );
        await readImage(converter, this.info, fillRow);
      }
    });
  }
}
