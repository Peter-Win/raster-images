import { textFromBuffer } from "../../utils/textFromBuffer";
import { Variables } from "../../ImageInfo/Variables";
import { RAStream, readByte, streamLock } from "../../stream";
import { BitmapFormat } from "../BitmapFormat";
import { onInvalidFormat } from "../onInvalidFormat";
import { onInvalidVersion } from "../onInvalidVersion";
import { GifLogicalScreen } from "./GifLogicalScreen";
import { Palette } from "../../Palette";
import { readPalette } from "../../Palette/readPalette";
import { skipGifData } from "./skipGifData";
import { FrameGif } from "./FrameGif";

/**
 * https://www.w3.org/Graphics/GIF/spec-gif89a.txt
 */

enum ChunkCode {
  beginOfImage = 0x2c,
  endOfStream = 0x3b,
}

export class FormatGif implements BitmapFormat {
  frames: FrameGif[] = [];

  vars: Variables = {};

  screen: GifLogicalScreen;

  palette?: Palette;

  protected constructor(readonly stream: RAStream) {
    this.screen = new GifLogicalScreen();
  }

  static create(stream: RAStream): Promise<FormatGif> {
    return streamLock<FormatGif>(stream, async () => {
      const inst = new FormatGif(stream);

      await stream.seek(0);
      const chunk1 = await stream.read(3);
      if (textFromBuffer(chunk1) !== "GIF") onInvalidFormat("GIF", stream.name);
      const ver = textFromBuffer(await stream.read(3));
      if (ver !== "87a" && ver !== "89a") {
        onInvalidVersion(ver, "GIF", stream);
      }
      // Logical Screen Descriptor
      inst.screen = await GifLogicalScreen.read(stream);

      // Global Color Table
      if (inst.screen.isGlobalTable) {
        const { tableSize } = inst.screen;
        inst.palette = await readPalette(stream, tableSize, { rgb: true });
      }

      const streamSize = await stream.getSize();
      for (;;) {
        const curPos = await stream.getPos();
        if (curPos >= streamSize) break;
        const code = await readByte(stream);
        if (code === ChunkCode.endOfStream) {
          break;
        }
        if (code === ChunkCode.beginOfImage) {
          const frame = await FrameGif.create(inst);
          inst.frames.push(frame);
        } else {
          // skip a label
          await stream.skip(1);
          await skipGifData(stream);
        }
      }

      return inst;
    });
  }
}
